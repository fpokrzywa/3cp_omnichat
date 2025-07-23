import React, { useState } from 'react';
import { X, Search, Heart, ExternalLink, ChevronDown } from 'lucide-react';
import { mongoService, type MongoPrompt } from '../services/mongoService';

interface Prompt {
  id: string;
  title: string;
  description: string;
  assistant: string;
  task?: string;
  functionalArea?: string;
  tags: string[];
}

interface PromptCatalogProps {
  isOpen: boolean;
  onClose: () => void;
  onPromptSelect: (promptText: string, assistantName: string) => void;
  onOpenFullCatalog: () => void;
  selectedAssistant?: string;
}

const PromptCatalog: React.FC<PromptCatalogProps> = ({ 
  isOpen, 
  onClose, 
  onPromptSelect, 
  onOpenFullCatalog, 
  selectedAssistant 
}) => {
  const [activeTab, setActiveTab] = useState<'enterprise' | 'your'>('enterprise');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAssistant, setFilterAssistant] = useState('All Assistants');
  const [selectedTask, setSelectedTask] = useState('Select Task...');
  const [selectedFunctionalArea, setSelectedFunctionalArea] = useState('Select Functional Area...');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set the filter to the selected assistant when the overlay opens
  React.useEffect(() => {
    if (isOpen && selectedAssistant) {
      setFilterAssistant(selectedAssistant);
    }
  }, [isOpen, selectedAssistant]);

  // Load prompts from MongoDB when component mounts or when overlay opens
  React.useEffect(() => {
    if (isOpen && activeTab === 'enterprise') {
      loadPromptsFromMongo();
    }
  }, [isOpen, activeTab]);

  const loadPromptsFromMongo = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (mongoService.isMongoConnected()) {
        const mongoPrompts = await mongoService.getPrompts();
        const convertedPrompts: Prompt[] = mongoPrompts.map(prompt => ({
          id: prompt.id,
          title: prompt.title,
          description: prompt.description,
          assistant: prompt.assistant,
          task: prompt.task,
          functionalArea: prompt.functionalArea,
          tags: prompt.tags
        }));
        setPrompts(convertedPrompts);
      } else {
        // Fallback to hardcoded prompts if MongoDB is not connected
    return [
      {
        "id": "1",
        "title": "Brainstorm ideas for a new marketing campaign.",
        "description": "Generate creative ideas and strategies for an upcoming marketing campaign.",
        "assistant": "OmniChat",
        "tags": ["Marketing", "Brainstorming"]
      },
      {
        "id": "2",
        "title": "Write a short story about a futuristic city.",
        "description": "Create a captivating short story set in a technologically advanced, futuristic urban environment.",
        "assistant": "OmniChat",
        "tags": ["Creative Writing", "Fiction"]
      },
      {
        "id": "3",
        "title": "Explain the concept of quantum entanglement simply.",
        "description": "Provide a clear and easy-to-understand explanation of quantum entanglement for a general audience.",
        "assistant": "OmniChat",
        "tags": ["Science", "Education"]
      },
      {
        "id": "4",
        "title": "Summarize the key points of the attached research paper.",
        "description": "Condense the essential information and main findings from the provided research paper.",
        "assistant": "OmniChat",
        "task": "Files",
        "tags": ["Summarization", "Research", "Files"]
      },
      {
        "id": "5",
        "title": "Generate a list of interview questions for a software engineer role.",
        "description": "Formulate relevant and insightful interview questions suitable for evaluating candidates for a software engineer position.",
        "assistant": "OmniChat",
        "tags": ["Hiring", "HR"]
      },
      {
        "id": "6",
        "title": "How do I troubleshoot a printer that isn't printing?",
        "description": "Provide step-by-step instructions for diagnosing and resolving common printer issues.",
        "assistant": "IT Support",
        "tags": ["Troubleshooting", "Hardware"]
      },
      {
        "id": "7",
        "title": "My email is not syncing. What should I do?",
        "description": "Offer guidance on troubleshooting email synchronization problems across various platforms.",
        "assistant": "IT Support",
        "tags": ["Email", "Troubleshooting"]
      },
      {
        "id": "8",
        "title": "I forgot my password for the company VPN. How can I reset it?",
        "description": "Explain the procedure for resetting a forgotten VPN password.",
        "assistant": "IT Support",
        "tags": ["Password Reset", "Security"]
      },
      {
        "id": "9",
        "title": "How can I connect to the office Wi-Fi network?",
        "description": "Provide instructions for connecting a device to the company's wireless network.",
        "assistant": "IT Support",
        "tags": ["Network", "Connectivity"]
      },
      {
        "id": "10",
        "title": "My computer is running very slowly. Any tips?",
        "description": "Suggest common methods to improve the performance of a slow computer.",
        "assistant": "IT Support",
        "tags": ["Performance", "Troubleshooting"]
      },
      {
        "id": "11",
        "title": "What are the company's policies on paid time off (PTO)?",
        "description": "Provide details regarding the company's policy on vacation, sick leave, and other forms of paid time off.",
        "assistant": "HR Support",
        "tags": ["Benefits", "Policies"]
      },
      {
        "id": "12",
        "title": "How do I submit an expense report?",
        "description": "Outline the process and requirements for submitting employee expense reports.",
        "assistant": "HR Support",
        "tags": ["Expenses", "Procedures"]
      },
      {
        "id": "13",
        "title": "What is the procedure for requesting a leave of absence?",
        "description": "Explain the steps involved in formally requesting a leave of absence from work.",
        "assistant": "HR Support",
        "tags": ["Leave", "Policies"]
      },
      {
        "id": "14",
        "title": "Can you explain the health insurance benefits available to employees?",
        "description": "Detail the various health insurance plans and benefits offered to employees.",
        "assistant": "HR Support",
        "tags": ["Benefits", "Insurance"]
      },
      {
        "id": "15",
        "title": "What is the company's code of conduct?",
        "description": "Provide an overview of the company's ethical guidelines and behavioral expectations.",
        "assistant": "HR Support",
        "tags": ["Policies", "Ethics"]
      },
      {
        "id": "16",
        "title": "Summarize the key takeaways from the 'Employee Handbook' policy document.",
        "description": "Extract and present the most important information from the company's employee handbook.",
        "assistant": "Advance Policies Assistant",
        "task": "Files",
        "tags": ["Policy Analysis", "Summarization", "Files"]
      },
      {
        "id": "17",
        "title": "Explain the implications of the 'Remote Work Policy' on travel expenses.",
        "description": "Clarify how the remote work policy impacts employee travel expense reimbursement.",
        "assistant": "Advance Policies Assistant",
        "tags": ["Policy Interpretation", "Remote Work"]
      },
      {
        "id": "18",
        "title": "Compare the 'Data Privacy Policy' with GDPR regulations.",
        "description": "Analyze and highlight the similarities and differences between the company's data privacy policy and GDPR.",
        "assistant": "Advance Policies Assistant",
        "tags": ["Compliance", "Legal", "Data Privacy"]
      },
      {
        "id": "19",
        "title": "What are the disciplinary actions outlined in the 'HR Disciplinary Policy'?",
        "description": "List and explain the disciplinary measures detailed in the HR disciplinary policy.",
        "assistant": "Advance Policies Assistant",
        "tags": ["HR", "Policy Enforcement"]
      },
      {
        "id": "20",
        "title": "Provide a concise summary of the 'IT Security Policy' for new hires.",
        "description": "Create a brief and easy-to-understand summary of the IT security policy specifically for onboarding new employees.",
        "assistant": "Advance Policies Assistant",
        "tags": ["Onboarding", "IT Security"]
      },
      {
        "id": "21",
        "title": "Redact all personal identifiable information (PII) from this document.",
        "description": "Automatically identify and remove all sensitive personal data from the provided document.",
        "assistant": "Redact Assistant",
        "task": "Files",
        "tags": ["Data Privacy", "Redaction", "Files"]
      },
      {
        "id": "22",
        "title": "Find and redact all financial figures and account numbers in the attached report.",
        "description": "Locate and obscure all monetary values and banking details within the given financial report.",
        "assistant": "Redact Assistant",
        "task": "Files",
        "tags": ["Financial Data", "Redaction", "Files"]
      },
      {
        "id": "23",
        "title": "Anonymize all names and addresses in this research dataset.",
        "description": "Replace all names and residential addresses with generic identifiers to ensure anonymity in the dataset.",
        "assistant": "Redact Assistant",
        "task": "Files",
        "tags": ["Anonymization", "Research", "Files"]
      },
      {
        "id": "24",
        "title": "Remove all references to internal project names from this public-facing document.",
        "description": "Eliminate any mentions of internal project codenames or confidential project identifiers from the document intended for public release.",
        "assistant": "Redact Assistant",
        "task": "Files",
        "tags": ["Confidentiality", "Public Relations", "Files"]
      },
      {
        "id": "25",
        "title": "Censor sensitive legal case details in this court transcript.",
        "description": "Apply appropriate redaction to sensitive and private information found within the court transcript to comply with legal privacy requirements.",
        "assistant": "Redact Assistant",
        "task": "Files",
        "tags": ["Legal", "Privacy", "Files"]
      },
      {
        "id": "26",
        "title": "Extract names and addresses from scanned invoices and input them into a spreadsheet.",
        "description": "Automatically read and transfer customer names and billing addresses from scanned invoices into a structured spreadsheet format.",
        "assistant": "ADEPT Assistant",
        "task": "Files",
        "tags": ["Data Entry", "Automation", "Files"]
      },
      {
        "id": "27",
        "title": "Categorize incoming support tickets based on keywords and assign them to departments.",
        "description": "Analyze the content of new support tickets, identify keywords, and automatically route them to the appropriate support department.",
        "assistant": "ADEPT Assistant",
        "task": "Files",
        "tags": ["Ticketing", "Workflow Automation", "Files"]
      },
      {
        "id": "28",
        "title": "Validate customer information in a database against a provided list.",
        "description": "Cross-reference customer data in an existing database with a given list to identify discrepancies or confirm accuracy.",
        "assistant": "ADEPT Assistant",
        "task": "Files",
        "tags": ["Data Validation", "Database Management", "Files"]
      },
      {
        "id": "29",
        "title": "Automate data extraction from expense receipts and populate an expense report template.",
        "description": "Parse relevant information (e.g., vendor, amount, date) from uploaded expense receipts and automatically fill out a predefined expense report form.",
        "assistant": "ADEPT Assistant",
        "task": "Files",
        "tags": ["Expense Management", "OCR", "Files"]
      },
      {
        "id": "30",
        "title": "Convert handwritten notes from meeting minutes into structured text for archiving.",
        "description": "Process images of handwritten meeting notes and transcribe them into searchable, digital text for easy archiving and retrieval.",
        "assistant": "ADEPT Assistant",
        "task": "Files",
        "tags": ["Transcription", "Archiving", "Files"]
      },
      {
        "id": "31",
        "title": "Draft a response to an RFP for IT services, highlighting our cybersecurity expertise.",
        "description": "Generate a comprehensive response to a Request for Proposal (RFP) for IT services, emphasizing the company's strengths in cybersecurity.",
        "assistant": "RFP Assistant",
        "tags": ["RFP", "IT Services", "Cybersecurity"]
      },
      {
        "id": "32",
        "title": "Tailor our standard RFP template to address the specific requirements of the healthcare industry.",
        "description": "Adapt and customize the existing RFP template to meet the unique needs and regulatory considerations of the healthcare sector.",
        "assistant": "RFP Assistant",
        "tags": ["RFP Customization", "Healthcare"]
      },
      {
        "id": "33",
        "title": "Identify and address all mandatory compliance requirements from the attached RFP document.",
        "description": "Review the provided RFP document to pinpoint all compulsory compliance clauses and suggest appropriate responses.",
        "assistant": "RFP Assistant",
        "task": "Files",
        "tags": ["Compliance", "RFP Analysis", "Files"]
      },
      {
        "id": "34",
        "title": "Suggest competitive pricing strategies for an RFP on cloud computing solutions.",
        "description": "Propose effective pricing models and strategies to win an RFP for cloud computing services.",
        "assistant": "RFP Assistant",
        "tags": ["Pricing", "Cloud Computing"]
      },
      {
        "id": "35",
        "title": "Generate a concise executive summary for our RFP submission for a government contract.",
        "description": "Create a brief yet impactful executive summary for the RFP response, tailored for a government contract bid.",
        "assistant": "RFP Assistant",
        "tags": ["Executive Summary", "Government Contracts"]
      },
      {
        "id": "36",
        "title": "Create a resume for a marketing manager with 5 years of experience in digital campaigns.",
        "description": "Develop a professional resume for a marketing manager, showcasing experience in digital marketing campaigns.",
        "assistant": "Resume Assistant",
        "tags": ["Resume Writing", "Marketing"]
      },
      {
        "id": "37",
        "title": "Optimize my current resume for a software developer position at a tech startup.",
        "description": "Refine and enhance an existing resume to align with the requirements of a software developer role at a technology startup.",
        "assistant": "Resume Assistant",
        "task": "Files",
        "tags": ["Resume Optimization", "Software Development", "Files"]
      },
      {
        "id": "38",
        "title": "Write a compelling cover letter to accompany my resume for a project management role.",
        "description": "Draft a persuasive cover letter designed to complement a resume for a project management position.",
        "assistant": "Resume Assistant",
        "tags": ["Cover Letter", "Project Management"]
      },
      {
        "id": "39",
        "title": "Highlight my leadership skills and team achievements in my resume for a senior leadership role.",
        "description": "Emphasize leadership capabilities and significant team accomplishments within the resume for a senior management or executive position.",
        "assistant": "Resume Assistant",
        "tags": ["Leadership", "Resume Content"]
      },
      {
        "id": "40",
        "title": "Suggest action verbs and industry-specific keywords to improve my resume for a healthcare administration job.",
        "description": "Provide a list of powerful action verbs and relevant keywords specific to the healthcare administration industry to enhance resume impact.",
        "assistant": "Resume Assistant",
        "tags": ["Keywords", "Healthcare", "Resume Improvement"]
      }
    ];
  }

  async getPromptsByAssistant(assistant: string): Promise<MongoPrompt[]> {
    const allPrompts = await this.getPrompts();
    return allPrompts.filter(prompt => prompt.assistant === assistant);
  }

  async searchPrompts(query: string): Promise<MongoPrompt[]> {
    const allPrompts = await this.getPrompts();
    const searchRegex = new RegExp(query, 'i');
    
    return allPrompts.filter(prompt => 
      searchRegex.test(prompt.title) ||
      searchRegex.test(prompt.description) ||
      prompt.tags.some(tag => searchRegex.test(tag))
    );
  }

  async addPrompt(prompt: Omit<MongoPrompt, '_id'>): Promise<boolean> {
    try {
      // This would typically call your backend API endpoint
      console.log('Would add prompt to MongoDB:', prompt);
      return true;
    } catch (error) {
      console.error('Error adding prompt to MongoDB:', error);
      return false;
    }
  }

  async updatePrompt(id: string, updates: Partial<MongoPrompt>): Promise<boolean> {
    try {
      // This would typically call your backend API endpoint
      console.log('Would update prompt in MongoDB:', { id, updates });
      return true;
    } catch (error) {
      console.error('Error updating prompt in MongoDB:', error);
      return false;
    }
  }

  async deletePrompt(id: string): Promise<boolean> {
    try {
      // This would typically call your backend API endpoint
      console.log('Would delete prompt from MongoDB:', id);
      return true;
    } catch (error) {
      console.error('Error deleting prompt from MongoDB:', error);
      return false;
    }
  }

  isMongoConnected(): boolean {
    return !!(this.connectionString && this.databaseName && this.collectionName);
  }

  getConnectionInfo() {
    return {
      database: this.databaseName,
      collection: this.collectionName,
      hasConnectionString: !!this.connectionString,
      isConfigured: this.isMongoConnected()
    };
  }
}

export const mongoService = new MongoService();
export type { MongoPrompt };
   // All available assistants from the assistants page
  const availableAssistants = [
    'OmniChat',
    'IT Support',
    'HR Support',
    'Advance Policies Assitant',
    'Redact Assistant',
    'ADEPT Assistant',
    'RFP Assistant',
    'RFP Assistant',
    'Resume Assistant'
  ];

  const prompts: Prompt[] = [
  {
    "id": "1",
    "title": "Brainstorm ideas for a new marketing campaign.",
    "description": "Generate creative ideas and strategies for an upcoming marketing campaign.",
    "assistant": "OmniChat",
    "tags": ["Marketing", "Brainstorming"]
  },
  {
    "id": "2",
    "title": "Write a short story about a futuristic city.",
    "description": "Create a captivating short story set in a technologically advanced, futuristic urban environment.",
    "assistant": "OmniChat",
    "tags": ["Creative Writing", "Fiction"]
  },
  {
    "id": "3",
    "title": "Explain the concept of quantum entanglement simply.",
    "description": "Provide a clear and easy-to-understand explanation of quantum entanglement for a general audience.",
    "assistant": "OmniChat",
    "tags": ["Science", "Education"]
  },
  {
    "id": "4",
    "title": "Summarize the key points of the attached research paper.",
    "description": "Condense the essential information and main findings from the provided research paper.",
    "assistant": "OmniChat",
    "task": "Files",
    "tags": ["Summarization", "Research", "Files"]
  },
  {
    "id": "5",
    "title": "Generate a list of interview questions for a software engineer role.",
    "description": "Formulate relevant and insightful interview questions suitable for evaluating candidates for a software engineer position.",
    "assistant": "OmniChat",
    "tags": ["Hiring", "HR"]
  },
  {
    "id": "6",
    "title": "How do I troubleshoot a printer that isn't printing?",
    "description": "Provide step-by-step instructions for diagnosing and resolving common printer issues.",
    "assistant": "IT Support",
    "tags": ["Troubleshooting", "Hardware"]
  },
  {
    "id": "7",
    "title": "My email is not syncing. What should I do?",
    "description": "Offer guidance on troubleshooting email synchronization problems across various platforms.",
    "assistant": "IT Support",
    "tags": ["Email", "Troubleshooting"]
  },
  {
    "id": "8",
    "title": "I forgot my password for the company VPN. How can I reset it?",
    "description": "Explain the procedure for resetting a forgotten VPN password.",
    "assistant": "IT Support",
    "tags": ["Password Reset", "Security"]
  },
  {
    "id": "9",
    "title": "How can I connect to the office Wi-Fi network?",
    "description": "Provide instructions for connecting a device to the company's wireless network.",
    "assistant": "IT Support",
    "tags": ["Network", "Connectivity"]
  },
  {
    "id": "10",
    "title": "My computer is running very slowly. Any tips?",
    "description": "Suggest common methods to improve the performance of a slow computer.",
    "assistant": "IT Support",
    "tags": ["Performance", "Troubleshooting"]
  },
  {
    "id": "11",
    "title": "What are the company's policies on paid time off (PTO)?",
    "description": "Provide details regarding the company's policy on vacation, sick leave, and other forms of paid time off.",
    "assistant": "HR Support",
    "tags": ["Benefits", "Policies"]
  },
  {
    "id": "12",
    "title": "How do I submit an expense report?",
    "description": "Outline the process and requirements for submitting employee expense reports.",
    "assistant": "HR Support",
    "tags": ["Expenses", "Procedures"]
  },
  {
    "id": "13",
    "title": "What is the procedure for requesting a leave of absence?",
    "description": "Explain the steps involved in formally requesting a leave of absence from work.",
    "assistant": "HR Support",
    "tags": ["Leave", "Policies"]
  },
  {
    "id": "14",
    "title": "Can you explain the health insurance benefits available to employees?",
    "description": "Detail the various health insurance plans and benefits offered to employees.",
    "assistant": "HR Support",
    "tags": ["Benefits", "Insurance"]
  },
  {
    "id": "15",
    "title": "What is the company's code of conduct?",
    "description": "Provide an overview of the company's ethical guidelines and behavioral expectations.",
    "assistant": "HR Support",
    "tags": ["Policies", "Ethics"]
  },
  {
    "id": "16",
    "title": "Summarize the key takeaways from the 'Employee Handbook' policy document.",
    "description": "Extract and present the most important information from the company's employee handbook.",
    "assistant": "Advance Policies Assistant",
    "task": "Files",
    "tags": ["Policy Analysis", "Summarization", "Files"]
  },
  {
    "id": "17",
    "title": "Explain the implications of the 'Remote Work Policy' on travel expenses.",
    "description": "Clarify how the remote work policy impacts employee travel expense reimbursement.",
    "assistant": "Advance Policies Assistant",
    "tags": ["Policy Interpretation", "Remote Work"]
  },
  {
    "id": "18",
    "title": "Compare the 'Data Privacy Policy' with GDPR regulations.",
    "description": "Analyze and highlight the similarities and differences between the company's data privacy policy and GDPR.",
    "assistant": "Advance Policies Assistant",
    "tags": ["Compliance", "Legal", "Data Privacy"]
  },
  {
    "id": "19",
    "title": "What are the disciplinary actions outlined in the 'HR Disciplinary Policy'?",
    "description": "List and explain the disciplinary measures detailed in the HR disciplinary policy.",
    "assistant": "Advance Policies Assistant",
    "tags": ["HR", "Policy Enforcement"]
  },
  {
    "id": "20",
    "title": "Provide a concise summary of the 'IT Security Policy' for new hires.",
    "description": "Create a brief and easy-to-understand summary of the IT security policy specifically for onboarding new employees.",
    "assistant": "Advance Policies Assistant",
    "tags": ["Onboarding", "IT Security"]
  },
  {
    "id": "21",
    "title": "Redact all personal identifiable information (PII) from this document.",
    "description": "Automatically identify and remove all sensitive personal data from the provided document.",
    "assistant": "Redact Assistant",
    "task": "Files",
    "tags": ["Data Privacy", "Redaction", "Files"]
  },
  {
    "id": "22",
    "title": "Find and redact all financial figures and account numbers in the attached report.",
    "description": "Locate and obscure all monetary values and banking details within the given financial report.",
    "assistant": "Redact Assistant",
    "task": "Files",
    "tags": ["Financial Data", "Redaction", "Files"]
  },
  {
    "id": "23",
    "title": "Anonymize all names and addresses in this research dataset.",
    "description": "Replace all names and residential addresses with generic identifiers to ensure anonymity in the dataset.",
    "assistant": "Redact Assistant",
    "task": "Files",
    "tags": ["Anonymization", "Research", "Files"]
  },
  {
    "id": "24",
    "title": "Remove all references to internal project names from this public-facing document.",
    "description": "Eliminate any mentions of internal project codenames or confidential project identifiers from the document intended for public release.",
    "assistant": "Redact Assistant",
    "task": "Files",
    "tags": ["Confidentiality", "Public Relations", "Files"]
  },
  {
    "id": "25",
    "title": "Censor sensitive legal case details in this court transcript.",
    "description": "Apply appropriate redaction to sensitive and private information found within the court transcript to comply with legal privacy requirements.",
    "assistant": "Redact Assistant",
    "task": "Files",
    "tags": ["Legal", "Privacy", "Files"]
  },
  {
    "id": "26",
    "title": "Extract names and addresses from scanned invoices and input them into a spreadsheet.",
    "description": "Automatically read and transfer customer names and billing addresses from scanned invoices into a structured spreadsheet format.",
    "assistant": "ADEPT Assistant",
    "task": "Files",
    "tags": ["Data Entry", "Automation", "Files"]
  },
  {
    "id": "27",
    "title": "Categorize incoming support tickets based on keywords and assign them to departments.",
    "description": "Analyze the content of new support tickets, identify keywords, and automatically route them to the appropriate support department.",
    "assistant": "ADEPT Assistant",
    "task": "Files",
    "tags": ["Ticketing", "Workflow Automation", "Files"]
  },
  {
    "id": "28",
    "title": "Validate customer information in a database against a provided list.",
    "description": "Cross-reference customer data in an existing database with a given list to identify discrepancies or confirm accuracy.",
    "assistant": "ADEPT Assistant",
    "task": "Files",
    "tags": ["Data Validation", "Database Management", "Files"]
  },
  {
    "id": "29",
    "title": "Automate data extraction from expense receipts and populate an expense report template.",
    "description": "Parse relevant information (e.g., vendor, amount, date) from uploaded expense receipts and automatically fill out a predefined expense report form.",
    "assistant": "ADEPT Assistant",
    "task": "Files",
    "tags": ["Expense Management", "OCR", "Files"]
  },
  {
    "id": "30",
    "title": "Convert handwritten notes from meeting minutes into structured text for archiving.",
    "description": "Process images of handwritten meeting notes and transcribe them into searchable, digital text for easy archiving and retrieval.",
    "assistant": "ADEPT Assistant",
    "task": "Files",
    "tags": ["Transcription", "Archiving", "Files"]
  },
  {
    "id": "31",
    "title": "Draft a response to an RFP for IT services, highlighting our cybersecurity expertise.",
    "description": "Generate a comprehensive response to a Request for Proposal (RFP) for IT services, emphasizing the company's strengths in cybersecurity.",
    "assistant": "RFP Assistant",
    "tags": ["RFP", "IT Services", "Cybersecurity"]
  },
  {
    "id": "32",
    "title": "Tailor our standard RFP template to address the specific requirements of the healthcare industry.",
    "description": "Adapt and customize the existing RFP template to meet the unique needs and regulatory considerations of the healthcare sector.",
    "assistant": "RFP Assistant",
    "tags": ["RFP Customization", "Healthcare"]
  },
  {
    "id": "33",
    "title": "Identify and address all mandatory compliance requirements from the attached RFP document.",
    "description": "Review the provided RFP document to pinpoint all compulsory compliance clauses and suggest appropriate responses.",
    "assistant": "RFP Assistant",
    "task": "Files",
    "tags": ["Compliance", "RFP Analysis", "Files"]
  },
  {
    "id": "34",
    "title": "Suggest competitive pricing strategies for an RFP on cloud computing solutions.",
    "description": "Propose effective pricing models and strategies to win an RFP for cloud computing services.",
    "assistant": "RFP Assistant",
    "tags": ["Pricing", "Cloud Computing"]
  },
  {
    "id": "35",
    "title": "Generate a concise executive summary for our RFP submission for a government contract.",
    "description": "Create a brief yet impactful executive summary for the RFP response, tailored for a government contract bid.",
    "assistant": "RFP Assistant",
    "tags": ["Executive Summary", "Government Contracts"]
  },
  {
    "id": "36",
    "title": "Create a resume for a marketing manager with 5 years of experience in digital campaigns.",
    "description": "Develop a professional resume for a marketing manager, showcasing experience in digital marketing campaigns.",
    "assistant": "Resume Assistant",
    "tags": ["Resume Writing", "Marketing"]
  },
  {
    "id": "37",
    "title": "Optimize my current resume for a software developer position at a tech startup.",
    "description": "Refine and enhance an existing resume to align with the requirements of a software developer role at a technology startup.",
    "assistant": "Resume Assistant",
    "task": "Files",
    "tags": ["Resume Optimization", "Software Development", "Files"]
  },
  {
    "id": "38",
    "title": "Write a compelling cover letter to accompany my resume for a project management role.",
    "description": "Draft a persuasive cover letter designed to complement a resume for a project management position.",
    "assistant": "Resume Assistant",
    "tags": ["Cover Letter", "Project Management"]
  },
  {
    "id": "39",
    "title": "Highlight my leadership skills and team achievements in my resume for a senior leadership role.",
    "description": "Emphasize leadership capabilities and significant team accomplishments within the resume for a senior management or executive position.",
    "assistant": "Resume Assistant",
    "tags": ["Leadership", "Resume Content"]
  },
  {
    "id": "40",
    "title": "Suggest action verbs and industry-specific keywords to improve my resume for a healthcare administration job.",
    "description": "Provide a list of powerful action verbs and relevant keywords specific to the healthcare administration industry to enhance resume impact.",
    "assistant": "Resume Assistant",
    "tags": ["Keywords", "Healthcare", "Resume Improvement"]
  }
];

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAssistant = filterAssistant === 'All Assistants' || prompt.assistant === filterAssistant;
    const matchesTask = selectedTask === 'Select Task...' || prompt.task === selectedTask;
    const matchesFunctionalArea = selectedFunctionalArea === 'Select Functional Area...' || 
                                 prompt.functionalArea === selectedFunctionalArea;
    
    return matchesSearch && matchesAssistant && matchesTask && matchesFunctionalArea;
  });

  const handlePromptClick = (prompt: Prompt) => {
    onPromptSelect(prompt.description, prompt.assistant);
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Prompt Catalog</h2>
          <div className="flex items-center space-x-4">
            <button 
              onClick={onOpenFullCatalog}
              className="flex items-center space-x-2 text-pink-600 hover:text-pink-700 transition-colors"
            >
              <span className="text-sm">View full Prompt Catalog</span>
              <ExternalLink className="w-4 h-4" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('enterprise')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'enterprise'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Advance Common Prompts
          </button>
          <button
            onClick={() => setActiveTab('your')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'your'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Your Prompts
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Assistant</label>
              <div className="relative">
                <select
                  value={filterAssistant}
                  onChange={(e) => setFilterAssistant(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option>All Assistants</option>
                  {availableAssistants.map((assistant) => (
                    <option key={assistant} value={assistant}>
                      {assistant}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  {filterAssistant !== 'All Assistants' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setFilterAssistant('All Assistants');
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Task</label>
              <div className="relative">
                <select
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option>Select Task...</option>
                  <option>Files</option>
                  <option>Commercialization</option>
                  <option>Research</option>
                  <option>Talent Acquisition</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Functional Area</label>
              <div className="relative">
                <select
                  value={selectedFunctionalArea}
                  onChange={(e) => setSelectedFunctionalArea(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option>Select Functional Area...</option>
                  <option>Research & Development</option>
                  <option>Commercial</option>
                  <option>Human Resources</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search prompt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'enterprise' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPrompts.map((prompt) => (
                <div
                  key={prompt.id}
                  onClick={() => handlePromptClick(prompt)}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs font-medium text-gray-500">{prompt.assistant}</span>
                      </div>
                      <h3 className="text-sm font-medium text-pink-600 leading-relaxed mb-2 group-hover:text-pink-700 transition-colors">
                      </h3>
                      <h3 className="text-sm font-medium text-gray-900 leading-relaxed mb-2 group-hover:text-pink-600 transition-colors">
                        {prompt.title}
                      </h3>
                    </div>
                    <button className="text-gray-300 hover:text-pink-500 transition-colors flex-shrink-0 ml-2">
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed mb-3">
                    {prompt.description}
                  </p>

                  {prompt.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {prompt.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No personal prompts yet</h3>
              <p className="text-gray-500">Create your first prompt to get started</p>
            </div>
          )}

          {filteredPrompts.length === 0 && activeTab === 'enterprise' && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No prompts found</h3>
              <p className="text-gray-500">Try adjusting your search terms or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptCatalog;