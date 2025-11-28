
export interface AppConfig {
  apiKey: string;
  appsScriptUrl: string;
  sheetName: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  userLinkedIn?: string;
  googleClientId?: string;
  googleClientSecret?: string;
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
  jobTitle: string; // Extracted or first few words
  content: string;
}

// Add types for Google Identity Services
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
    html2pdf: any; // For the PDF library
  }
}
