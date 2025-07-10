interface OpenAIAssistant {
  id: string;
  name: string;
  description: string;
  instructions: string;
  model: string;
  tools: any[];
  created_at: number;
  metadata: Record<string, any>;
}

interface Assistant {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isFavorite?: boolean;
  model?: string;
  instructions?: string;
  isCustom?: boolean;
}

class OpenAIService {
  private apiKey: string | null = null;
  private baseURL = 'https://api.openai.com/v1';

  constructor() {
    // Try to get API key from environment first, then localStorage
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem('openai_api_key') || null;
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem('openai_api_key', apiKey);
  }

  getApiKey(): string | null {
    // Always check environment first
    return import.meta.env.VITE_OPENAI_API_KEY || this.apiKey;
  }

  clearApiKey() {
    // Only clear localStorage key, not environment
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      this.apiKey = null;
      localStorage.removeItem('openai_api_key');
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
      // Handle CORS and network errors specifically
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to OpenAI API directly from browser. This is a CORS limitation. Please use a backend server or proxy to access OpenAI assistants.');
      }
      throw error;
    }
  }

  async listAssistants(): Promise<OpenAIAssistant[]> {
    try {
      const response = await this.makeRequest('/assistants?limit=100');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching assistants:', error);
      throw error;
    }
  }

  async getAssistant(assistantId: string): Promise<OpenAIAssistant> {
    try {
      return await this.makeRequest(`/assistants/${assistantId}`);
    } catch (error) {
      console.error('Error fetching assistant:', error);
      throw error;
    }
  }

  // Convert OpenAI assistant to our internal format
  convertToInternalFormat(openaiAssistant: OpenAIAssistant): Assistant {
    // Generate icon and color based on assistant name or tools
    const { icon, color } = this.generateIconAndColor(openaiAssistant);

    return {
      id: openaiAssistant.id,
      name: openaiAssistant.name || 'Unnamed Assistant',
      description: openaiAssistant.description || openaiAssistant.instructions?.substring(0, 100) + '...' || 'No description available',
      icon,
      color,
      model: openaiAssistant.model,
      instructions: openaiAssistant.instructions,
      isFavorite: false
    };
  }

  private generateIconAndColor(assistant: OpenAIAssistant): { icon: string; color: string } {
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-purple-100 text-purple-600',
      'bg-yellow-100 text-yellow-600',
      'bg-red-100 text-red-600',
      'bg-indigo-100 text-indigo-600',
      'bg-pink-100 text-pink-600',
      'bg-teal-100 text-teal-600',
      'bg-orange-100 text-orange-600',
      'bg-cyan-100 text-cyan-600'
    ];

    // Generate icon based on tools or name
    let icon = '🤖'; // Default robot icon

    if (assistant.tools && assistant.tools.length > 0) {
      const toolTypes = assistant.tools.map(tool => tool.type);
      
      if (toolTypes.includes('code_interpreter')) {
        icon = '💻';
      } else if (toolTypes.includes('file_search')) {
        icon = '🔍';
      } else if (toolTypes.includes('function')) {
        icon = '⚡';
      }
    } else if (assistant.name) {
      // Generate icon based on name keywords
      const name = assistant.name.toLowerCase();
      if (name.includes('code') || name.includes('programming')) {
        icon = '💻';
      } else if (name.includes('write') || name.includes('content')) {
        icon = '✍️';
      } else if (name.includes('analyze') || name.includes('data')) {
        icon = '📊';
      } else if (name.includes('support') || name.includes('help')) {
        icon = '🔧';
      } else if (name.includes('creative') || name.includes('design')) {
        icon = '🎨';
      } else if (name.includes('research')) {
        icon = '🔬';
      } else if (name.includes('translate')) {
        icon = '🌐';
      } else if (name.includes('math') || name.includes('calculate')) {
        icon = '🧮';
      }
    }

    // Generate color based on assistant ID for consistency
    const colorIndex = assistant.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    const color = colors[colorIndex];

    return { icon, color };
  }

  // Test API connection
  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/models?limit=1');
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const openaiService = new OpenAIService();
export type { Assistant, OpenAIAssistant };