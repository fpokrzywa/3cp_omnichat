interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatThread {
  id: string;
  assistantId: string;
  assistantName: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

class ChatService {
  private apiKey: string | null = null;
  private baseURL = 'https://api.openai.com/v1';
  private threads: Map<string, ChatThread> = new Map();
  private currentThreadId: string | null = null;

  constructor() {
    // Get API key from environment or localStorage
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem('openai_api_key') || null;
    this.loadThreadsFromStorage();
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem('openai_api_key', apiKey);
  }

  getApiKey(): string | null {
    return import.meta.env.VITE_OPENAI_API_KEY || this.apiKey;
  }

  private loadThreadsFromStorage() {
    try {
      const stored = localStorage.getItem('chat_threads');
      if (stored) {
        const threadsData = JSON.parse(stored);
        this.threads = new Map(
          threadsData.map((thread: any) => [
            thread.id,
            {
              ...thread,
              createdAt: new Date(thread.createdAt),
              updatedAt: new Date(thread.updatedAt),
              messages: thread.messages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
              }))
            }
          ])
        );
      }
    } catch (error) {
      console.warn('Error loading chat threads from storage:', error);
    }
  }

  private saveThreadsToStorage() {
    try {
      const threadsArray = Array.from(this.threads.values());
      localStorage.setItem('chat_threads', JSON.stringify(threadsArray));
    } catch (error) {
      console.warn('Error saving chat threads to storage:', error);
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const currentApiKey = this.getApiKey();
    if (!currentApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${currentApiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        throw new Error(error.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to OpenAI API directly from browser. This is a CORS limitation.');
      }
      throw error;
    }
  }

  createThread(assistantName: string, displayName: string): string {
    const threadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const thread: ChatThread = {
      id: threadId,
      assistantId: assistantName,
      assistantName: displayName,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.threads.set(threadId, thread);
    this.currentThreadId = threadId;
    this.saveThreadsToStorage();
    return threadId;
  }

  getCurrentThread(): ChatThread | null {
    if (!this.currentThreadId) return null;
    return this.threads.get(this.currentThreadId) || null;
  }

  getThread(threadId: string): ChatThread | null {
    return this.threads.get(threadId) || null;
  }

  getAllThreads(): ChatThread[] {
    return Array.from(this.threads.values()).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  setCurrentThread(threadId: string) {
    if (this.threads.has(threadId)) {
      this.currentThreadId = threadId;
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async sendMessage(message: string, threadId?: string): Promise<ChatMessage> {
    const targetThreadId = threadId || this.currentThreadId;
    if (!targetThreadId) {
      throw new Error('No active chat thread');
    }

    const thread = this.threads.get(targetThreadId);
    if (!thread) {
      throw new Error('Thread not found');
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: this.generateMessageId(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    thread.messages.push(userMessage);
    thread.updatedAt = new Date();

    // Add loading assistant message
    const loadingMessage: ChatMessage = {
      id: this.generateMessageId(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    };

    thread.messages.push(loadingMessage);
    this.saveThreadsToStorage();

    try {
      // For now, we'll simulate the OpenAI API call since direct browser calls have CORS issues
      // In a real implementation, this would go through a backend proxy
      const assistantResponse = await this.simulateAssistantResponse(message, thread.assistantName);
      
      // Update the loading message with the actual response
      const responseMessage: ChatMessage = {
        ...loadingMessage,
        content: assistantResponse,
        isLoading: false
      };

      // Replace loading message with actual response
      const loadingIndex = thread.messages.findIndex(msg => msg.id === loadingMessage.id);
      if (loadingIndex !== -1) {
        thread.messages[loadingIndex] = responseMessage;
      }

      thread.updatedAt = new Date();
      this.saveThreadsToStorage();

      return responseMessage;
    } catch (error) {
      // Remove loading message on error
      thread.messages = thread.messages.filter(msg => msg.id !== loadingMessage.id);
      this.saveThreadsToStorage();
      throw error;
    }
  }

  private async simulateAssistantResponse(userMessage: string, assistantName: string): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Generate contextual responses based on assistant type
    const responses = this.getContextualResponses(assistantName, userMessage);
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getContextualResponses(assistantName: string, userMessage: string): string[] {
    const message = userMessage.toLowerCase();

    if (assistantName === 'IT Support') {
      if (message.includes('password') || message.includes('login')) {
        return [
          "I can help you with password issues. For security reasons, I'll need to verify your identity first. Here's what you can do:\n\n1. **Self-Service Reset**: Use our password reset portal at portal.company.com/reset\n2. **Verify Identity**: You'll need your employee ID and registered email\n3. **Security Questions**: Answer the security questions you set up during onboarding\n4. **Contact IT**: If self-service doesn't work, call IT at ext. 4357\n\nFor future reference, passwords must be at least 12 characters with uppercase, lowercase, numbers, and special characters. They expire every 90 days.",
          "Password problems are very common, so don't worry! Let me walk you through the troubleshooting steps:\n\n**Quick Fixes:**\n1. Check if Caps Lock is enabled\n2. Try typing your password in a text editor first to verify it's correct\n3. Clear your browser cache and cookies\n4. Try using an incognito/private browsing window\n\n**Advanced Steps:**\n5. Restart your computer to clear any cached credentials\n6. Check if your account is locked (you'll get a specific error message)\n7. Verify you're using the correct username format (usually firstname.lastname)\n\n**Still Having Issues?**\nContact IT support at help@company.com or call ext. 4357. We're available 24/7 for password emergencies."
        ];
      }
      if (message.includes('printer') || message.includes('print')) {
        return [
          "Let me help you troubleshoot your printer issues. Here's a comprehensive step-by-step guide:\n\n**Basic Checks:**\n1. Verify the printer is powered on and all cables are securely connected\n2. Check if there are any error lights or messages on the printer display\n3. Ensure there's paper in the tray and toner/ink cartridges aren't empty\n\n**Software Troubleshooting:**\n4. Restart the Print Spooler service:\n   - Press Win+R, type 'services.msc'\n   - Find 'Print Spooler', right-click and restart\n5. Clear the print queue of any stuck jobs\n6. Update or reinstall printer drivers from the manufacturer's website\n\n**Network Printer Issues:**\n7. Check if other users can print to the same printer\n8. Verify the printer's IP address hasn't changed\n9. Try printing a test page directly from the printer\n\nIf these steps don't resolve the issue, please let me know the specific error message and printer model.",
          "Printer problems can be frustrating! Let me guide you through a systematic approach:\n\n**Physical Inspection:**\n- Check all cable connections (USB, Ethernet, power)\n- Verify paper is loaded correctly and not jammed\n- Ensure toner/ink cartridges are properly installed and not empty\n- Look for any error messages on the printer's display panel\n\n**Windows Troubleshooting:**\n1. Go to Settings > Devices > Printers & scanners\n2. Remove the problematic printer\n3. Restart your computer\n4. Re-add the printer (it should auto-detect)\n5. Set it as the default printer if needed\n\n**Advanced Solutions:**\n- Download latest drivers from manufacturer's website\n- Run Windows built-in printer troubleshooter\n- Check if Windows Update has any pending driver updates\n- For network printers, verify the IP address and network connectivity\n\nWhat specific issue are you experiencing? Is it not printing at all, printing blank pages, or showing error messages?"
        ];
      }
      return [
        "Hello! I'm here to help with all your IT support needs. I can assist with a wide range of technical issues including:\n\n**Common Issues I Handle:**\n- Password resets and account lockouts\n- Printer and hardware troubleshooting\n- Software installation and updates\n- Network connectivity problems\n- Email configuration and sync issues\n- VPN setup and connection problems\n- Computer performance optimization\n- Security software and antivirus issues\n\n**To Better Assist You:**\nPlease provide details about:\n1. What specific problem you're experiencing\n2. Any error messages you've seen (exact wording helps)\n3. When the issue started occurring\n4. What device/software you're using\n5. Any troubleshooting steps you've already tried\n\nThe more information you can provide, the faster I can help resolve your issue!",
        "Welcome to IT Support! I'm here to help resolve any technical challenges you're facing.\n\n**How I Can Help:**\n- Troubleshoot hardware and software issues\n- Guide you through step-by-step solutions\n- Provide preventive maintenance tips\n- Help with account and security issues\n- Assist with software installations and updates\n- Resolve network and connectivity problems\n\n**For Fastest Resolution:**\nWhen describing your issue, please include:\n- Detailed description of the problem\n- Exact error messages (screenshots are helpful)\n- Your operating system and software versions\n- When the issue first occurred\n- Any recent changes to your system\n\n**Emergency Support:**\nFor urgent issues affecting business operations, call our emergency line at ext. 911 or email urgent@company.com\n\nWhat technical issue can I help you with today?"
      ];
    }

    if (assistantName === 'HR Support') {
      if (message.includes('pto') || message.includes('vacation') || message.includes('time off')) {
        return [
          "I'd be happy to help you with PTO (Paid Time Off) information and procedures.\n\n**PTO Request Process:**\n1. **Advance Notice**: Submit requests at least 2 weeks in advance (4 weeks for extended leave)\n2. **HR Portal**: Log into the employee portal at hr.company.com\n3. **Manager Approval**: Your direct manager must approve all PTO requests\n4. **Blackout Periods**: Some departments have blackout periods during busy seasons\n\n**PTO Accrual Rates:**\n- 0-2 years: 15 days annually (1.25 days/month)\n- 3-5 years: 20 days annually (1.67 days/month)\n- 6+ years: 25 days annually (2.08 days/month)\n\n**Important Notes:**\n- PTO rolls over up to 40 hours annually\n- Unused PTO over the limit is forfeited on December 31st\n- You can check your current balance in the employee dashboard\n- Sick leave is separate from PTO (10 days annually)\n\n**Need Help?**\nContact HR at hr@company.com or call ext. 2468 if you have trouble accessing the portal.",
          "Let me provide you with comprehensive information about our time off policies:\n\n**Types of Leave Available:**\n- **PTO (Paid Time Off)**: Vacation, personal days\n- **Sick Leave**: Medical appointments, illness\n- **Personal Leave**: Unpaid time off for personal matters\n- **FMLA**: Family and Medical Leave Act (eligible after 1 year)\n- **Bereavement**: Up to 5 days for immediate family\n\n**PTO Accrual Schedule:**\nYour PTO accrual depends on your length of service:\n- New employees: 15 days/year (prorated first year)\n- 3+ years: 20 days/year\n- 6+ years: 25 days/year\n- 10+ years: 30 days/year\n\n**Request Guidelines:**\n- Submit requests through the HR portal\n- Minimum 2 weeks notice for regular PTO\n- 30 days notice for extended leave (5+ consecutive days)\n- Manager approval required\n- Consider team coverage and project deadlines\n\n**Checking Your Balance:**\nView your current PTO balance in the employee self-service portal or on your pay stub.\n\nDo you have specific questions about requesting time off or your current balance?"
        ];
      }
      if (message.includes('benefits') || message.includes('insurance')) {
        return [
          "I'm happy to provide information about our comprehensive benefits package:\n\n**Health Insurance Options:**\n- **PPO Plan**: Higher premiums, more flexibility in choosing providers\n- **HMO Plan**: Lower premiums, requires primary care physician referrals\n- **High Deductible Health Plan (HDHP)**: Lower premiums, paired with HSA\n- **Health Savings Account (HSA)**: Tax-advantaged savings for medical expenses\n\n**Additional Insurance:**\n- **Dental**: Two plan options (Basic and Premium)\n- **Vision**: Coverage for exams, glasses, and contacts\n- **Life Insurance**: Basic coverage provided, additional coverage available\n- **Disability**: Short-term and long-term disability insurance\n\n**Retirement Benefits:**\n- **401(k) Plan**: Company matches 50% of contributions up to 6% of salary\n- **Vesting**: Immediate vesting for employee contributions, 3-year vesting for company match\n- **Investment Options**: 15+ fund choices including target-date funds\n\n**Other Benefits:**\n- Flexible Spending Accounts (FSA) for healthcare and dependent care\n- Employee Assistance Program (EAP)\n- Tuition reimbursement up to $5,000 annually\n- Wellness programs and gym membership discounts\n\n**Open Enrollment:**\nAnnual enrollment period is November 1-15. You can make changes outside this period only for qualifying life events.\n\nWould you like detailed information about any specific benefit?",
          "Let me break down our comprehensive benefits package for you:\n\n**Medical Coverage:**\nWe offer three medical plan options to fit different needs and budgets:\n1. **Traditional PPO**: Most flexibility, higher cost\n2. **HMO**: Lower cost, requires referrals\n3. **High Deductible + HSA**: Lowest premiums, tax savings\n\n**Company Contributions:**\n- Medical: Company pays 80% of premiums\n- Dental: Company pays 100% of basic plan\n- Vision: Company pays 75% of premiums\n- Life Insurance: Basic coverage (1x salary) provided free\n\n**Retirement Planning:**\n- 401(k) with company match up to 3% of salary\n- Immediate vesting on your contributions\n- Company match vests over 3 years\n- Financial planning resources available\n\n**Work-Life Balance:**\n- Flexible work arrangements\n- Employee Assistance Program (confidential counseling)\n- Wellness programs with premium discounts\n- Professional development opportunities\n\n**Family Benefits:**\n- Maternity/Paternity leave\n- Dependent care FSA\n- Family medical coverage options\n- Adoption assistance program\n\n**Getting Started:**\nNew employees have 30 days to enroll. Schedule a benefits consultation with our team at benefits@company.com or call ext. 2469.\n\nWhat specific aspect of our benefits would you like to explore further?"
        ];
      }
      return [
        "Welcome to HR Support! I'm here to assist you with all human resources related questions and concerns.\n\n**Areas I Can Help With:**\n\n**Benefits & Compensation:**\n- Health, dental, and vision insurance\n- 401(k) and retirement planning\n- Flexible spending accounts\n- Life and disability insurance\n- Salary and bonus information\n\n**Time Off & Leave:**\n- PTO requests and balances\n- Sick leave policies\n- FMLA and family leave\n- Bereavement and personal leave\n- Holiday schedules\n\n**Policies & Procedures:**\n- Employee handbook questions\n- Code of conduct\n- Performance review process\n- Disciplinary procedures\n- Workplace policies\n\n**Career Development:**\n- Training and development opportunities\n- Tuition reimbursement\n- Internal job postings\n- Performance improvement resources\n\n**Workplace Issues:**\n- Conflict resolution\n- Harassment or discrimination concerns\n- Accommodation requests\n- Employee relations\n\n**Administrative Support:**\n- Payroll questions\n- Address or emergency contact changes\n- Employment verification\n- Tax document requests\n\n**Confidential Matters:**\nFor sensitive issues, you can always request a private meeting or call our confidential hotline.\n\nWhat HR topic can I help you with today?",
        "Hello! I'm your HR Support assistant, ready to help with any human resources questions or concerns you may have.\n\n**Quick Access Resources:**\n- **Employee Portal**: Access pay stubs, benefits, and personal information\n- **HR Handbook**: Complete policies and procedures guide\n- **Benefits Summary**: Overview of all available benefits\n- **Emergency Contacts**: Important HR phone numbers and emails\n\n**Common Requests I Handle:**\n\n**🏥 Benefits Questions**\n- Insurance enrollment and changes\n- Claims assistance\n- FSA and HSA information\n- Retirement plan guidance\n\n**📅 Time Off Management**\n- PTO balance inquiries\n- Leave request procedures\n- FMLA eligibility\n- Holiday schedules\n\n**📋 Policy Clarification**\n- Workplace guidelines\n- Performance expectations\n- Compliance requirements\n- Code of conduct\n\n**💼 Career Support**\n- Professional development\n- Internal opportunities\n- Training programs\n- Performance resources\n\n**🤝 Employee Relations**\n- Workplace concerns\n- Conflict resolution\n- Accommodation requests\n- Confidential reporting\n\n**Contact Information:**\n- Email: hr@company.com\n- Phone: ext. 2468\n- Emergency HR Line: ext. 911\n\nHow can I assist you today? Please feel free to ask about any HR-related topic!"
      ];
    }

    if (assistantName === 'Coding Assistant') {
      if (message.includes('business rule') || message.includes('incident') || message.includes('urgent')) {
        return [
          "I can definitely help you create a business rule for setting incident priorities. Here's a comprehensive approach:\n\n**Business Rule Structure:**\n```javascript\nfunction setIncidentPriority(incident) {\n  // Priority levels: Critical, High, Medium, Low\n  \n  // Critical Priority Conditions\n  if (incident.description.toLowerCase().includes('urgent') ||\n      incident.impact === 'system-wide' ||\n      incident.affectedUsers > 1000) {\n    return 'Critical';\n  }\n  \n  // High Priority Conditions\n  if (incident.severity === 'high' ||\n      incident.businessImpact === 'revenue-affecting' ||\n      incident.affectedUsers > 100) {\n    return 'High';\n  }\n  \n  // Medium Priority (default for most cases)\n  if (incident.affectedUsers > 10 ||\n      incident.category === 'functionality') {\n    return 'Medium';\n  }\n  \n  // Low Priority\n  return 'Low';\n}\n```\n\n**Implementation Options:**\n\n1. **Database Trigger Approach:**\n```sql\nCREATE TRIGGER set_incident_priority\nBEFORE INSERT ON incidents\nFOR EACH ROW\nBEGIN\n  IF NEW.description LIKE '%urgent%' THEN\n    SET NEW.priority = 'Critical';\n  ELSEIF NEW.affected_users > 100 THEN\n    SET NEW.priority = 'High';\n  ELSE\n    SET NEW.priority = 'Medium';\n  END IF;\nEND;\n```\n\n2. **Application Logic (Node.js/Express):**\n```javascript\nconst priorityRules = {\n  keywords: {\n    critical: ['urgent', 'emergency', 'outage', 'down'],\n    high: ['important', 'asap', 'priority'],\n    medium: ['issue', 'problem', 'bug']\n  },\n  \n  evaluatePriority(description, metadata) {\n    const desc = description.toLowerCase();\n    \n    if (this.keywords.critical.some(word => desc.includes(word))) {\n      return 'Critical';\n    }\n    \n    if (metadata.affectedUsers > 500) {\n      return 'Critical';\n    }\n    \n    if (this.keywords.high.some(word => desc.includes(word))) {\n      return 'High';\n    }\n    \n    return 'Medium';\n  }\n};\n```\n\n**Configuration Options:**\n- Make keywords configurable through admin panel\n- Add time-based rules (after-hours = higher priority)\n- Include customer tier considerations (VIP customers)\n- Add escalation rules for unresolved incidents\n\nWould you like me to elaborate on any specific implementation approach or add additional criteria to the business rule?",
          "Absolutely! Creating an automated business rule for incident priority assignment is a great way to ensure consistency. Let me provide you with a comprehensive solution:\n\n**Priority Matrix Framework:**\n\n```javascript\nclass IncidentPriorityEngine {\n  constructor() {\n    this.rules = {\n      // Keyword-based rules\n      urgentKeywords: ['urgent', 'emergency', 'critical', 'outage', 'down', 'broken'],\n      highKeywords: ['important', 'asap', 'priority', 'blocking'],\n      \n      // Impact-based rules\n      impactLevels: {\n        critical: { userThreshold: 1000, revenueImpact: true },\n        high: { userThreshold: 100, functionalityImpact: true },\n        medium: { userThreshold: 10, minorImpact: true }\n      }\n    };\n  }\n  \n  calculatePriority(incident) {\n    let score = 0;\n    const description = incident.description.toLowerCase();\n    \n    // Keyword analysis\n    if (this.containsUrgentKeywords(description)) {\n      score += 100;\n    } else if (this.containsHighKeywords(description)) {\n      score += 75;\n    }\n    \n    // Impact analysis\n    score += this.calculateImpactScore(incident);\n    \n    // Time sensitivity\n    score += this.calculateTimeScore(incident);\n    \n    // Customer tier\n    score += this.calculateCustomerScore(incident);\n    \n    return this.scoreToPriority(score);\n  }\n  \n  containsUrgentKeywords(text) {\n    return this.rules.urgentKeywords.some(keyword => text.includes(keyword));\n  }\n  \n  containsHighKeywords(text) {\n    return this.rules.highKeywords.some(keyword => text.includes(keyword));\n  }\n  \n  calculateImpactScore(incident) {\n    if (incident.affectedUsers > 1000) return 80;\n    if (incident.affectedUsers > 100) return 60;\n    if (incident.affectedUsers > 10) return 40;\n    return 20;\n  }\n  \n  calculateTimeScore(incident) {\n    const hour = new Date().getHours();\n    // Business hours (9 AM - 5 PM) get higher priority\n    if (hour >= 9 && hour <= 17) return 20;\n    return 10;\n  }\n  \n  calculateCustomerScore(incident) {\n    if (incident.customerTier === 'enterprise') return 30;\n    if (incident.customerTier === 'premium') return 20;\n    return 10;\n  }\n  \n  scoreToPriority(score) {\n    if (score >= 150) return 'Critical';\n    if (score >= 100) return 'High';\n    if (score >= 60) return 'Medium';\n    return 'Low';\n  }\n}\n```\n\n**Database Implementation:**\n\n```sql\n-- Create priority rules table\nCREATE TABLE priority_rules (\n  id INT PRIMARY KEY AUTO_INCREMENT,\n  rule_type VARCHAR(50),\n  condition_field VARCHAR(100),\n  condition_operator VARCHAR(20),\n  condition_value VARCHAR(255),\n  priority_score INT,\n  is_active BOOLEAN DEFAULT TRUE\n);\n\n-- Insert sample rules\nINSERT INTO priority_rules VALUES\n(1, 'keyword', 'description', 'contains', 'urgent', 100, TRUE),\n(2, 'impact', 'affected_users', '>', '1000', 80, TRUE),\n(3, 'customer', 'customer_tier', '=', 'enterprise', 30, TRUE);\n\n-- Stored procedure for priority calculation\nDELIMITER //\nCREATE PROCEDURE CalculateIncidentPriority(\n  IN incident_id INT,\n  OUT calculated_priority VARCHAR(20)\n)\nBEGIN\n  DECLARE total_score INT DEFAULT 0;\n  DECLARE done INT DEFAULT FALSE;\n  DECLARE rule_score INT;\n  \n  -- Calculate total score based on active rules\n  -- (Implementation would iterate through rules)\n  \n  -- Convert score to priority\n  IF total_score >= 150 THEN\n    SET calculated_priority = 'Critical';\n  ELSEIF total_score >= 100 THEN\n    SET calculated_priority = 'High';\n  ELSEIF total_score >= 60 THEN\n    SET calculated_priority = 'Medium';\n  ELSE\n    SET calculated_priority = 'Low';\n  END IF;\nEND //\nDELIMITER ;\n```\n\n**Integration Example:**\n\n```javascript\n// Express.js endpoint\napp.post('/api/incidents', async (req, res) => {\n  try {\n    const incident = req.body;\n    \n    // Initialize priority engine\n    const priorityEngine = new IncidentPriorityEngine();\n    \n    // Calculate priority\n    incident.priority = priorityEngine.calculatePriority(incident);\n    incident.priorityScore = priorityEngine.getLastScore();\n    \n    // Save to database\n    const savedIncident = await Incident.create(incident);\n    \n    // Send notifications based on priority\n    if (incident.priority === 'Critical') {\n      await notificationService.sendUrgentAlert(savedIncident);\n    }\n    \n    res.json(savedIncident);\n  } catch (error) {\n    res.status(500).json({ error: error.message });\n  }\n});\n```\n\n**Configuration Dashboard:**\nYou could also create an admin interface to manage these rules dynamically without code changes.\n\nWould you like me to show you how to implement the admin interface or focus on any specific part of this solution?"
        ];
      }
      
      if (message.includes('code') || message.includes('function') || message.includes('programming')) {
        return [
          "I'd be happy to help you with coding! As a Coding Assistant, I can assist with various programming languages and development tasks.\n\n**Programming Languages I Support:**\n- JavaScript/TypeScript (Node.js, React, Vue, Angular)\n- Python (Django, Flask, FastAPI, data science)\n- Java (Spring Boot, Android development)\n- C# (.NET, ASP.NET Core)\n- PHP (Laravel, Symfony)\n- Go, Rust, C++\n- SQL (MySQL, PostgreSQL, MongoDB)\n\n**What I Can Help With:**\n\n**🔧 Code Development:**\n- Writing functions and classes\n- API development and integration\n- Database design and queries\n- Algorithm implementation\n- Code optimization\n\n**🐛 Debugging & Troubleshooting:**\n- Error analysis and fixes\n- Performance optimization\n- Code review and best practices\n- Testing strategies\n\n**🏗️ Architecture & Design:**\n- System design patterns\n- Database schema design\n- API architecture\n- Microservices design\n- Security implementations\n\n**📚 Learning & Best Practices:**\n- Code explanations\n- Best practice recommendations\n- Design pattern implementations\n- Performance optimization tips\n\n**Example Code Structure:**\n```javascript\n// I can help you write clean, well-documented code\nclass ExampleService {\n  constructor(config) {\n    this.config = config;\n  }\n  \n  async processData(input) {\n    try {\n      // Implementation with error handling\n      const result = await this.validateAndProcess(input);\n      return this.formatResponse(result);\n    } catch (error) {\n      this.handleError(error);\n      throw error;\n    }\n  }\n}\n```\n\nWhat specific coding challenge or project are you working on? Please share:\n- Programming language you're using\n- What you're trying to accomplish\n- Any specific requirements or constraints\n- Current code (if you have any)\n\nI'll provide detailed, working solutions with explanations!",
          "Great! I'm here to help with all your coding needs. Let me know what you're working on and I'll provide comprehensive assistance.\n\n**My Coding Expertise:**\n\n**Frontend Development:**\n- React, Vue.js, Angular\n- HTML5, CSS3, JavaScript/TypeScript\n- Responsive design and UI/UX\n- State management (Redux, Vuex, NgRx)\n- Build tools (Webpack, Vite, Parcel)\n\n**Backend Development:**\n- Node.js, Express.js, Fastify\n- Python (Django, Flask, FastAPI)\n- Java Spring Boot\n- C# .NET Core\n- RESTful APIs and GraphQL\n\n**Database & Data:**\n- SQL (MySQL, PostgreSQL, SQL Server)\n- NoSQL (MongoDB, Redis, DynamoDB)\n- Database design and optimization\n- Data modeling and migrations\n- Query optimization\n\n**DevOps & Tools:**\n- Docker containerization\n- CI/CD pipelines\n- Cloud platforms (AWS, Azure, GCP)\n- Version control (Git)\n- Testing frameworks\n\n**Code Quality & Best Practices:**\n```javascript\n// Example of clean, maintainable code structure\nclass UserService {\n  constructor(database, logger) {\n    this.db = database;\n    this.logger = logger;\n  }\n  \n  async createUser(userData) {\n    try {\n      // Validation\n      this.validateUserData(userData);\n      \n      // Business logic\n      const hashedPassword = await this.hashPassword(userData.password);\n      const user = {\n        ...userData,\n        password: hashedPassword,\n        createdAt: new Date(),\n        isActive: true\n      };\n      \n      // Database operation\n      const savedUser = await this.db.users.create(user);\n      \n      // Logging\n      this.logger.info(`User created: ${savedUser.id}`);\n      \n      // Return sanitized data\n      return this.sanitizeUser(savedUser);\n      \n    } catch (error) {\n      this.logger.error('User creation failed:', error);\n      throw new UserCreationError(error.message);\n    }\n  }\n  \n  validateUserData(data) {\n    const required = ['email', 'password', 'firstName', 'lastName'];\n    const missing = required.filter(field => !data[field]);\n    \n    if (missing.length > 0) {\n      throw new ValidationError(`Missing required fields: ${missing.join(', ')}`);\n    }\n    \n    if (!this.isValidEmail(data.email)) {\n      throw new ValidationError('Invalid email format');\n    }\n  }\n}\n```\n\n**How to Get the Best Help:**\n1. **Describe your goal**: What are you trying to build or solve?\n2. **Share your code**: Current implementation (if any)\n3. **Specify constraints**: Performance, security, or platform requirements\n4. **Include error messages**: Exact error text helps with debugging\n5. **Mention your experience level**: So I can adjust explanations accordingly\n\n**Common Tasks I Excel At:**\n- Writing complete, working code solutions\n- Debugging and fixing errors\n- Code reviews and optimization\n- Architecture and design recommendations\n- Testing strategies and implementation\n- Documentation and code comments\n\nWhat coding challenge can I help you tackle today?"
        ];
      }
      
      return [
        "Hello! I'm your Coding Assistant, ready to help with all your programming and development needs.\n\n**What I Can Do For You:**\n\n**💻 Code Development:**\n- Write complete functions, classes, and applications\n- Implement algorithms and data structures\n- Create APIs and web services\n- Build database schemas and queries\n- Develop user interfaces and components\n\n**🔍 Code Analysis & Debugging:**\n- Debug errors and fix issues\n- Optimize performance bottlenecks\n- Review code for best practices\n- Suggest improvements and refactoring\n- Identify security vulnerabilities\n\n**🏗️ Architecture & Design:**\n- Design system architecture\n- Choose appropriate design patterns\n- Plan database structures\n- Create API specifications\n- Design scalable solutions\n\n**📖 Learning & Explanation:**\n- Explain complex programming concepts\n- Provide step-by-step tutorials\n- Recommend learning resources\n- Share industry best practices\n- Help with code documentation\n\n**Technologies I Work With:**\n- **Languages**: JavaScript, Python, Java, C#, PHP, Go, Rust, C++\n- **Frontend**: React, Vue, Angular, HTML/CSS, TypeScript\n- **Backend**: Node.js, Django, Spring Boot, .NET, Express\n- **Databases**: MySQL, PostgreSQL, MongoDB, Redis\n- **Cloud**: AWS, Azure, Google Cloud\n- **Tools**: Docker, Git, CI/CD, Testing frameworks\n\n**Getting Started:**\nTo provide the most helpful assistance, please share:\n1. What programming language you're using\n2. What you're trying to accomplish\n3. Any existing code you're working with\n4. Specific challenges or errors you're facing\n5. Your experience level with the technology\n\n**Example of How I Help:**\n```javascript\n// Instead of just giving you a snippet, I provide:\n// 1. Complete, working code\n// 2. Clear explanations\n// 3. Best practices\n// 4. Error handling\n// 5. Testing suggestions\n\nclass DataProcessor {\n  constructor(options = {}) {\n    this.options = {\n      timeout: 5000,\n      retries: 3,\n      ...options\n    };\n  }\n  \n  async processData(data) {\n    // Implementation with proper error handling\n    // and clear documentation\n  }\n}\n```\n\nWhat coding project or challenge can I help you with today?",
        "Welcome! I'm here to provide comprehensive coding assistance for developers of all skill levels.\n\n**My Specialties:**\n\n**🚀 Full-Stack Development:**\n- Frontend frameworks (React, Vue, Angular)\n- Backend services (Node.js, Python, Java)\n- Database design and optimization\n- API development and integration\n- Real-time applications (WebSockets, Socket.io)\n\n**🛠️ Problem Solving:**\n- Algorithm design and implementation\n- Data structure optimization\n- Performance tuning and profiling\n- Memory management and efficiency\n- Scalability planning\n\n**🔒 Security & Best Practices:**\n- Secure coding practices\n- Authentication and authorization\n- Input validation and sanitization\n- SQL injection prevention\n- XSS and CSRF protection\n\n**🧪 Testing & Quality Assurance:**\n- Unit testing strategies\n- Integration testing\n- Test-driven development (TDD)\n- Code coverage analysis\n- Automated testing pipelines\n\n**📊 Data & Analytics:**\n- Data processing and ETL\n- Database query optimization\n- Data visualization\n- Machine learning integration\n- Big data solutions\n\n**Development Workflow:**\n```mermaid\ngraph LR\n    A[Requirements] --> B[Design]\n    B --> C[Implementation]\n    C --> D[Testing]\n    D --> E[Deployment]\n    E --> F[Monitoring]\n```\n\n**Code Quality Standards I Follow:**\n- Clean, readable, and maintainable code\n- Comprehensive error handling\n- Proper documentation and comments\n- Following language-specific conventions\n- Security-first approach\n- Performance optimization\n\n**How I Structure My Help:**\n1. **Understanding**: I'll ask clarifying questions to fully understand your needs\n2. **Solution Design**: I'll explain the approach before coding\n3. **Implementation**: Complete, working code with explanations\n4. **Testing**: Suggestions for testing your solution\n5. **Optimization**: Tips for improving performance and maintainability\n\n**Ready to Code?**\nShare your project details, and I'll provide:\n- Complete, production-ready code\n- Detailed explanations of the solution\n- Best practices and optimization tips\n- Testing strategies\n- Documentation and comments\n\nWhat would you like to build or improve today?"
      ];
    }
    // Default responses for other assistants
    return [
      `Hello! I'm ${assistantName}, and I'm here to provide you with comprehensive assistance tailored to your specific needs.\n\n**How I Can Help:**\nAs ${assistantName}, I'm designed to understand complex questions and provide detailed, actionable responses. I can help you with:\n\n- **Analysis and Research**: Breaking down complex topics and providing thorough explanations\n- **Problem Solving**: Working through challenges step-by-step with practical solutions\n- **Planning and Strategy**: Helping you develop comprehensive plans and approaches\n- **Creative Solutions**: Offering innovative ideas and alternative perspectives\n- **Detailed Guidance**: Providing step-by-step instructions and best practices\n\n**My Approach:**\n1. **Listen Carefully**: I pay attention to the specific details of your request\n2. **Ask Clarifying Questions**: If needed, I'll ask for more information to provide better help\n3. **Provide Comprehensive Answers**: I give thorough responses with examples and explanations\n4. **Offer Multiple Perspectives**: I consider different angles and approaches to your question\n5. **Follow Up**: I'm ready to dive deeper into any aspect that needs more exploration\n\n**Getting the Most from Our Conversation:**\n- Be specific about what you're trying to accomplish\n- Share any relevant context or background information\n- Let me know if you need examples, step-by-step guidance, or high-level overview\n- Feel free to ask follow-up questions for clarification\n\n**What I Excel At:**\n- Providing detailed, well-structured responses\n- Breaking down complex topics into understandable parts\n- Offering practical, actionable advice\n- Adapting my communication style to your needs\n- Maintaining context throughout our conversation\n\nWhat specific topic or challenge would you like to explore together? I'm ready to provide you with the detailed assistance you need!`,
      `Welcome! I'm ${assistantName}, your dedicated assistant ready to help you tackle any challenge or question you might have.\n\n**My Capabilities:**\n\n**🎯 Focused Expertise**: As ${assistantName}, I bring specialized knowledge and a systematic approach to problem-solving that's tailored to deliver exactly what you need.\n\n**📋 Comprehensive Analysis**: I don't just give quick answers - I provide thorough analysis that considers multiple angles, potential challenges, and various solutions.\n\n**🔍 Detail-Oriented Responses**: Whether you need a high-level overview or deep technical details, I adjust my responses to match your specific requirements and expertise level.\n\n**💡 Creative Problem Solving**: I combine analytical thinking with creative approaches to help you find innovative solutions to complex challenges.\n\n**🎯 Actionable Guidance**: My responses include practical steps, real-world examples, and actionable recommendations you can implement immediately.\n\n**How I Work:**\n\n**Step 1: Understanding**\n- I carefully analyze your question or request\n- I consider the context and any specific requirements\n- I identify the key objectives you're trying to achieve\n\n**Step 2: Research & Analysis**\n- I draw from comprehensive knowledge across multiple domains\n- I consider best practices and industry standards\n- I evaluate different approaches and their trade-offs\n\n**Step 3: Solution Development**\n- I craft detailed, well-structured responses\n- I provide examples and practical applications\n- I include implementation guidance and next steps\n\n**Step 4: Continuous Support**\n- I'm ready to clarify any points that need more explanation\n- I can dive deeper into specific aspects of the solution\n- I adapt my approach based on your feedback and follow-up questions\n\n**What Makes Me Different:**\n- **Thoroughness**: I provide comprehensive responses that cover all aspects of your question\n- **Clarity**: I explain complex concepts in clear, understandable terms\n- **Practicality**: I focus on solutions you can actually implement\n- **Adaptability**: I adjust my communication style to match your needs\n- **Reliability**: I maintain consistency and accuracy across our entire conversation\n\n**Ready to Get Started?**\nI'm here to help with whatever challenge or question you're facing. Whether it's:\n- Strategic planning and decision-making\n- Technical problem-solving\n- Creative brainstorming and ideation\n- Process improvement and optimization\n- Research and analysis\n- Or any other topic you'd like to explore\n\nJust share your question or describe what you're working on, and I'll provide you with the detailed, actionable assistance you need to move forward successfully!\n\nWhat would you like to work on together today?`
    ];
  }

  deleteThread(threadId: string) {
    this.threads.delete(threadId);
    if (this.currentThreadId === threadId) {
      this.currentThreadId = null;
    }
    this.saveThreadsToStorage();
  }

  clearAllThreads() {
    this.threads.clear();
    this.currentThreadId = null;
    this.saveThreadsToStorage();
  }

  // Method to integrate with real OpenAI API (requires backend proxy)
  async sendMessageToOpenAI(message: string, assistantId: string): Promise<string> {
    // This would be implemented when you have a backend proxy
    // For now, we'll use the simulation
    throw new Error('Direct OpenAI API integration requires a backend proxy due to CORS limitations');
  }
}

export const chatService = new ChatService();
export type { ChatMessage, ChatThread };