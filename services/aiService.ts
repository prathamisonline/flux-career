
import { GoogleGenAI } from "@google/genai";
import { AppConfig, ChatMessage } from "../types";

// --- INTERFACES ---

interface AIRequest {
  systemPrompt: string;
  userPrompt: string;
  config: AppConfig;
}

// --- PROVIDER HANDLERS ---

const callGemini = async (request: AIRequest): Promise<string> => {
  const apiKey = request.config.geminiApiKey;
  if (!apiKey) throw new Error("Gemini API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });
  
  // Combine system prompt and user prompt for simplicity with GenAI SDK
  // or use systemInstruction if the specific model supports it. 
  // For broad compatibility (Flash/Pro), we'll prepend the system prompt.
  const fullPrompt = `${request.systemPrompt}\n\nUSER REQUEST:\n${request.userPrompt}`;

  try {
    const response = await ai.models.generateContent({
      model: request.config.model || 'gemini-2.5-flash',
      contents: fullPrompt,
    });
    return response.text || "";
  } catch (error: any) {
    throw new Error(`Gemini Error: ${error.message}`);
  }
};

const callOpenAI = async (request: AIRequest): Promise<string> => {
  const apiKey = request.config.openAiApiKey;
  if (!apiKey) throw new Error("OpenAI API Key is missing.");

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: request.config.model || "gpt-4o",
        messages: [
          { role: "system", content: request.systemPrompt },
          { role: "user", content: request.userPrompt }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "OpenAI Request Failed");
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (error: any) {
    throw new Error(`OpenAI Error: ${error.message}`);
  }
};

const callOpenRouter = async (request: AIRequest): Promise<string> => {
  const apiKey = request.config.openRouterApiKey;
  if (!apiKey) throw new Error("OpenRouter API Key is missing.");

  // OpenRouter uses the exact same format as OpenAI
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.origin, // Required by OpenRouter
        "X-Title": "Flux Career"
      },
      body: JSON.stringify({
        model: request.config.model || "deepseek/deepseek-r1",
        messages: [
          { role: "system", content: request.systemPrompt },
          { role: "user", content: request.userPrompt }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "OpenRouter Request Failed");
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (error: any) {
    throw new Error(`OpenRouter Error: ${error.message}`);
  }
};

// --- MAIN DISPATCHER ---

const generateText = async (request: AIRequest): Promise<string> => {
  const { provider } = request.config;

  switch (provider) {
    case 'gemini':
      return callGemini(request);
    case 'openai':
      return callOpenAI(request);
    case 'openrouter':
      return callOpenRouter(request);
    default:
      // Fallback for legacy configs
      if (request.config.apiKey) {
        return callGemini({ ...request, config: { ...request.config, geminiApiKey: request.config.apiKey } });
      }
      throw new Error(`Unsupported provider: ${provider}`);
  }
};

// --- PUBLIC METHODS (Matches old geminiService signature) ---

export const generateCoverLetter = async (
  jobDescription: string, 
  resumeText: string,
  userName: string,
  tone: string,
  length: string, 
  language: string,
  config: AppConfig
): Promise<string> => {
  
  const wordCountMap: Record<string, string> = {
    'Short': 'under 200 words',
    'Medium': 'approx 300 words',
    'Long': 'approx 500 words'
  };
  const lengthInstruction = wordCountMap[length] || 'approx 300 words';

  const contextSection = resumeText 
    ? `CANDIDATE'S RESUME:\n"${resumeText}"\n\nINSTRUCTION: Use the candidate's actual skills.`
    : `INSTRUCTION: The candidate has not provided a resume. Generalize based on the JD.`;

  const systemPrompt = `You are an expert career counselor. Write a ${tone} cover letter in ${language}. 
  Length: ${lengthInstruction}. 
  Structure: Hook -> Skills -> Fit -> CTA. 
  Sign off: "Best regards, ${userName || '[Your Name]'}". 
  NO header info (address/date). Start with Salutation. 
  NO bracketed placeholders.`;

  const userPrompt = `JOB DESCRIPTION:\n${jobDescription}\n\n${contextSection}`;

  const text = await generateText({ systemPrompt, userPrompt, config });
  return text.trim();
};

export const generateInterviewQuestions = async (
  jobDescription: string,
  config: AppConfig
): Promise<string> => {
  const systemPrompt = "You are a hiring manager. Generate 5 specific interview questions based on the job description provided. For each, add a brief 'Tip' on how to answer.";
  const userPrompt = `Job Description:\n${jobDescription.substring(0, 2000)}`;
  
  return generateText({ systemPrompt, userPrompt, config });
};

export const generateTailoredResume = async (
  jobDescription: string,
  resumeText: string,
  config: AppConfig
): Promise<string> => {
  if (!resumeText) throw new Error("Resume text required.");

  const systemPrompt = `You are an ATS Optimization Expert. 
  Rewrite the resume to target the Job Description.
  Output Format: Clean HTML tags only (<h3>, <ul>, <li>, <p>, <strong>). 
  NO <html> or <body> tags. NO markdown.
  Structure: Summary, Core Competencies, Experience.
  Prioritize achievements matching the JD.`;

  const userPrompt = `JOB DESCRIPTION:\n${jobDescription}\n\nORIGINAL RESUME:\n${resumeText}`;

  let text = await generateText({ systemPrompt, userPrompt, config });
  
  // Clean up common AI markdown artifacts
  text = text.replace(/```html/g, '').replace(/```/g, '').trim();
  return text;
};

export const sendChatResponse = async (
  history: ChatMessage[],
  context: {
    jobDescription: string;
    resumeText: string;
    currentDocument: string;
    documentType: 'Cover Letter' | 'Tailored Resume';
  },
  config: AppConfig
): Promise<string> => {
  const systemPrompt = `You are a professional editor assisting a candidate with their ${context.documentType}.
  
  CONTEXT:
  - Job Description Provided: ${context.jobDescription ? 'Yes' : 'No'}
  - Resume Provided: ${context.resumeText ? 'Yes' : 'No'}
  
  CURRENT DOCUMENT CONTENT:
  """
  ${context.currentDocument.substring(0, 15000)}
  """
  
  CRITICAL RULES:
  1. You are helpful and concise.
  2. If the user asks for an edit, correction, or rewrite, you MUST return the **FULL, COMPLETE DOCUMENT** with the changes applied. Do NOT return just a snippet.
  3. When returning document content, you MUST wrap it strictly in these tags: 
     <DOCUMENT_CONTENT>
     ... full document text/html here ...
     </DOCUMENT_CONTENT>
  4. Put your conversational reply (e.g., "I've corrected the dates...") OUTSIDE the tags.
  5. If the document is a Resume, strictly maintain the HTML structure (<h3>, <ul>, <li>, <strong>) inside the tags.
  6. Do NOT include markdown code blocks (like \`\`\`html) inside the <DOCUMENT_CONTENT> tags.
  `;

  // Format history into a conversation block
  const conversation = history.slice(-10).map(msg => 
    `${msg.role === 'user' ? 'USER' : 'ASSISTANT'}: ${msg.content}`
  ).join('\n\n');

  const userPrompt = `CHAT HISTORY:\n${conversation}\n\nUSER'S LATEST REQUEST: (See history)`;

  return generateText({ systemPrompt, userPrompt, config });
};
