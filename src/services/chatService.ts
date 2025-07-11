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
          "I can help you with password issues. For security reasons, I'll need to verify your identity first. Please contact your IT administrator or use the self-service password reset portal.",
          "Password problems are common. Try these steps: 1) Check if Caps Lock is on, 2) Clear your browser cache, 3) Try incognito mode. If issues persist, contact IT support."
        ];
      }
      if (message.includes('printer') || message.includes('print')) {
        return [
          "For printer issues, try these troubleshooting steps: 1) Check if the printer is powered on and connected, 2) Restart the print spooler service, 3) Update printer drivers. Let me know if you need more specific help.",
          "Printer not working? First, check the connection cables and ensure the printer has paper and toner. Then try removing and re-adding the printer in your system settings."
        ];
      }
      return [
        "I'm here to help with your IT support needs. Can you provide more details about the specific issue you're experiencing?",
        "Thanks for reaching out to IT Support. To better assist you, please describe the problem you're encountering and any error messages you've seen."
      ];
    }

    if (assistantName === 'HR Support') {
      if (message.includes('pto') || message.includes('vacation') || message.includes('time off')) {
        return [
          "For PTO requests, please log into the HR portal and submit your request at least 2 weeks in advance. Your manager will need to approve it. Current PTO balance can be viewed in your employee dashboard.",
          "Time off policies vary by department. Generally, you accrue PTO based on your tenure. Check the employee handbook for specific details or contact HR directly for your current balance."
        ];
      }
      if (message.includes('benefits') || message.includes('insurance')) {
        return [
          "Our benefits package includes health, dental, and vision insurance, plus 401k matching. Open enrollment is typically in November. You can review your current benefits in the HR portal.",
          "For benefits questions, I recommend scheduling a one-on-one with our benefits coordinator. They can walk you through all available options and help you make the best choices for your situation."
        ];
      }
      return [
        "I'm here to help with HR-related questions. Whether it's about benefits, policies, or workplace concerns, feel free to ask!",
        "Hello! I can assist with various HR topics including benefits, time off, policies, and general workplace questions. What would you like to know?"
      ];
    }

    // Default responses for other assistants
    return [
      `As ${assistantName}, I'm here to help you with your request. Based on what you've shared, let me provide some guidance and suggestions.`,
      `Thank you for your question. As ${assistantName}, I can assist you with this topic. Let me break down the key points and provide you with a comprehensive response.`,
      `I understand you're looking for help with this matter. As ${assistantName}, I'm designed to provide detailed and accurate assistance. Here's what I recommend...`
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