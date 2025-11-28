
// This file is deprecated. All logic moved to aiService.ts.
// Re-exporting for backward compatibility with existing imports.

import { generateCoverLetter as gcl, generateInterviewQuestions as giq, generateTailoredResume as gtr } from './aiService';
import { AppConfig } from '../types';

// Adapters to match old signature if needed, or simply re-export
export const generateCoverLetter = (
  jobDescription: string, 
  resumeText: string,
  userName: string,
  tone: string,
  length: string, 
  language: string, 
  model: string, 
  apiKey: string
) => {
  // Construct a temp config object to satisfy new service
  const config: AppConfig = {
    provider: 'gemini',
    geminiApiKey: apiKey,
    model: model,
    // defaults for rest
    openAiApiKey: '',
    openRouterApiKey: '',
    appsScriptUrl: '',
    sheetName: '',
    userName,
    userEmail: ''
  } as AppConfig;

  return gcl(jobDescription, resumeText, userName, tone, length, language, config);
};

export const generateInterviewQuestions = (jd: string, model: string, apiKey: string) => {
   const config: AppConfig = {
    provider: 'gemini',
    geminiApiKey: apiKey,
    model: model,
    openAiApiKey: '',
    openRouterApiKey: '',
    appsScriptUrl: '',
    sheetName: '',
    userName: '',
    userEmail: ''
  } as AppConfig;
  return giq(jd, config);
}

export const generateTailoredResume = (jd: string, resume: string, model: string, apiKey: string) => {
  const config: AppConfig = {
    provider: 'gemini',
    geminiApiKey: apiKey,
    model: model,
    openAiApiKey: '',
    openRouterApiKey: '',
    appsScriptUrl: '',
    sheetName: '',
    userName: '',
    userEmail: ''
  } as AppConfig;
  return gtr(jd, resume, config);
}
