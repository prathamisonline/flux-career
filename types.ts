
export type AIProvider = 'gemini' | 'openai' | 'openrouter';

export interface AppConfig {
  // Provider Selection
  provider: AIProvider;
  model: string;

  // API Keys
  geminiApiKey: string;
  openAiApiKey: string;
  openRouterApiKey: string; // Used for Anthropic/Claude, DeepSeek, Llama via OpenRouter

  // Legacy/Generic (mapped to Gemini for backward compat)
  apiKey?: string; 

  // Integrations
  appsScriptUrl: string;
  sheetName: string;
  googleClientId?: string;
  googleClientSecret?: string;

  // User Profile
  userName: string;
  userEmail: string;
  userPhone?: string;
  userLinkedIn?: string;
}

export interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface SheetPayload {
  timestamp: string;
  jobDescription: string;
  coverLetter: string;
  extractedEmail: string;
  senderName: string;
  senderEmail: string;
  sheetName: string;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  jobTitle: string; 
  content: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: any) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
    html2pdf: any; 
  }
}
