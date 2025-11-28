
import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Copy, 
  Trash2, 
  FileText, 
  Sparkles,
  Mail,
  Loader2,
  Lock,
  UserCircle,
  Moon,
  Sun,
  FileUser,
  Briefcase,
  BrainCircuit,
  X,
  History,
  Clock,
  Languages,
  AlignLeft,
  FileDown,
  Phone,
  Linkedin,
  FileBadge,
  ChevronDown
} from 'lucide-react';

import ConfigPanel from './components/ConfigPanel';
import LandingPage from './components/LandingPage';
import Toast from './components/Toast';

import { AppConfig, ToastState, HistoryItem } from './types';
import { extractEmail, copyToClipboard, downloadAsText, downloadAsPDF, sendToGoogleSheets } from './services/utils';
import { generateCoverLetter, generateInterviewQuestions, generateTailoredResume } from './services/geminiService';

// ------------------------------------------------------------------
// SYSTEM CONFIGURATION
// ------------------------------------------------------------------
const SYSTEM_CONFIG = {
  apiKey: process.env.API_KEY || '', 
  appsScriptUrl: 'https://script.google.com/macros/s/AKfycb.../exec',
  sheetName: 'Sheet1',
  googleClientId: '' 
};

const DEFAULT_USER_CONFIG: AppConfig = {
  ...SYSTEM_CONFIG,
  userName: '',
  userEmail: '',
  userPhone: '',
  userLinkedIn: ''
};

const TONES = [
  { id: 'Professional', label: 'Professional', icon: '👔' },
  { id: 'Enthusiastic', label: 'Enthusiastic', icon: '🚀' },
  { id: 'Confident', label: 'Confident', icon: '🦁' },
  { id: 'Direct', label: 'Direct', icon: '🎯' },
];

const LENGTHS = [
  { id: 'Short', label: 'Short (<200w)' },
  { id: 'Medium', label: 'Medium (~300w)' },
  { id: 'Long', label: 'Long (~500w)' },
];

const LANGUAGES = [
  { id: 'English', label: 'English', flag: '🇺🇸' },
  { id: 'Spanish', label: 'Spanish', flag: '🇪🇸' },
  { id: 'French', label: 'French', flag: '🇫🇷' },
  { id: 'German', label: 'German', flag: '🇩🇪' },
  { id: 'Hindi', label: 'Hindi', flag: '🇮🇳' },
];

const App: React.FC = () => {
  // Navigation State
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to Dark Mode for Flux theme

  // State: Configuration & UI
  const [config, setConfig] = useState<AppConfig>(DEFAULT_USER_CONFIG);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // State: Inputs
  const [activeTab, setActiveTab] = useState<'jd' | 'resume'>('jd');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  
  // State: Output Tabs
  const [outputTab, setOutputTab] = useState<'letter' | 'resume'>('letter');

  // Advanced Options
  const [selectedTone, setSelectedTone] = useState('Professional');
  const [selectedLength, setSelectedLength] = useState('Medium');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  
  // State: Outputs
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [generatedResume, setGeneratedResume] = useState(''); // New State for Resume HTML
  const [extractedEmail, setExtractedEmail] = useState<string | null>(null);
  const [interviewPrep, setInterviewPrep] = useState<string | null>(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // State: Operational
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPrepGenerating, setIsPrepGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });
  const [tokenClient, setTokenClient] = useState<any>(null);

  // Ref for auto-resizing textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Ref for resume content
  const resumeRef = useRef<HTMLDivElement>(null);

  // --- THEME MANAGEMENT ---
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // --- INITIALIZATION ---
  useEffect(() => {
    const savedConfig = localStorage.getItem('ai_cover_letter_user_profile');
    const savedJob = localStorage.getItem('ai_cover_letter_draft');
    const savedResume = localStorage.getItem('ai_cover_letter_resume');
    const savedHistory = localStorage.getItem('ai_cover_letter_history');
    
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(prev => ({ 
          ...prev, 
          userName: parsed.userName || '', 
          userEmail: parsed.userEmail || '',
          userPhone: parsed.userPhone || '',
          userLinkedIn: parsed.userLinkedIn || ''
        }));
      } catch (e) { console.error(e); }
    }
    if (savedJob) setJobDescription(savedJob);
    if (savedResume) setResumeText(savedResume);
    if (savedHistory) {
        try { setHistory(JSON.parse(savedHistory)); } catch(e) {}
    }
  }, []);

  // Save drafts
  useEffect(() => {
    localStorage.setItem('ai_cover_letter_user_profile', JSON.stringify({
      userName: config.userName,
      userEmail: config.userEmail,
      userPhone: config.userPhone,
      userLinkedIn: config.userLinkedIn
    }));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('ai_cover_letter_draft', jobDescription);
    const email = extractEmail(jobDescription);
    setExtractedEmail(email);
  }, [jobDescription]);

  useEffect(() => {
    localStorage.setItem('ai_cover_letter_resume', resumeText);
  }, [resumeText]);

  useEffect(() => {
    localStorage.setItem('ai_cover_letter_history', JSON.stringify(history));
  }, [history]);

  // Auto-resize logic for the generated letter textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [generatedLetter, outputTab]);

  // Initialize Google Token Client
  useEffect(() => {
    if (config.googleClientId && window.google) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: config.googleClientId,
          scope: 'https://www.googleapis.com/auth/spreadsheets',
          callback: (response: any) => {
            if (response.access_token) {
              handleSendToSheets(response.access_token);
            } else {
              showToast('Sign in failed or cancelled', 'error');
              setIsSending(false);
            }
          },
        });
        setTokenClient(client);
      } catch (e) { console.error(e); }
    }
  }, [config.googleClientId]);

  // Helpers
  const showToast = (message: string, type: ToastState['type']) => {
    setToast({ show: true, message, type });
  };

  const addToHistory = (content: string, jd: string) => {
    const title = jd.split('\n')[0].substring(0, 40) + '...';
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      jobTitle: title || 'Untitled Job',
      content
    };
    setHistory(prev => [newItem, ...prev].slice(0, 20)); // Keep last 20
  };

  const handleGenerate = async () => {
    if (!config.apiKey) {
      showToast('System Error: API Key not configured by administrator.', 'error');
      return;
    }
    if (!jobDescription.trim()) {
      showToast('Please enter a job description', 'error');
      setActiveTab('jd');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Determine what to generate based on the output tab
      if (outputTab === 'letter') {
        const letter = await generateCoverLetter(
          jobDescription, 
          resumeText,
          config.userName, 
          selectedTone,
          selectedLength,
          selectedLanguage,
          config.apiKey
        );
        setGeneratedLetter(letter);
        addToHistory(letter, jobDescription);
        showToast('Cover letter generated!', 'success');
      } else {
        // Generate Resume
        if (!resumeText.trim()) {
            showToast('Please provide your resume text for analysis first.', 'error');
            setActiveTab('resume');
            setIsGenerating(false);
            return;
        }
        const resumeHtml = await generateTailoredResume(
            jobDescription,
            resumeText,
            config.apiKey
        );
        setGeneratedResume(resumeHtml.trim());
        showToast('Tailored resume generated!', 'success');
      }

    } catch (error: any) {
      showToast(error.message || 'Failed to generate', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInterviewPrep = async () => {
    if (!jobDescription) return;
    setIsPrepGenerating(true);
    setShowInterviewModal(true);
    try {
      const prep = await generateInterviewQuestions(jobDescription, config.apiKey);
      setInterviewPrep(prep);
    } catch (e) {
      setInterviewPrep("Failed to generate questions.");
    } finally {
      setIsPrepGenerating(false);
    }
  };

  const initiateSend = () => {
    // Only supports sending cover letters currently for simplicity
    if (!generatedLetter && outputTab === 'letter') return;
    if (!config.appsScriptUrl) {
      showToast('System Error: Sheet URL not configured.', 'error');
      return;
    }

    if (config.googleClientId && tokenClient) {
      setIsSending(true);
      tokenClient.requestAccessToken();
    } else {
      handleSendToSheets();
    }
  };

  const handleSendToSheets = async (accessToken?: string) => {
    if (outputTab !== 'letter' || !generatedLetter) {
        showToast('Only Cover Letters can be sent to Sheets currently.', 'info');
        return;
    }
    setIsSending(true);
    try {
      await sendToGoogleSheets({
        timestamp: new Date().toISOString(),
        jobDescription,
        coverLetter: generatedLetter,
        extractedEmail: extractedEmail || '',
        senderName: config.userName,
        senderEmail: config.userEmail,
        sheetName: config.sheetName || 'Sheet1'
      }, config.appsScriptUrl, accessToken);
      
      showToast(accessToken ? 'Authenticated & Sent!' : 'Sent to Google Sheets!', 'success');
    } catch (error: any) {
      showToast('Failed to send.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = async (text: string) => {
    if (!text) return;
    const success = await copyToClipboard(text);
    if (success) showToast('Copied to clipboard', 'success');
    else showToast('Failed to copy', 'error');
  };

  const handleDownloadPdf = () => {
    const content = outputTab === 'letter' ? generatedLetter : generatedResume;
    if (!content) return;

    // 1. Sanitize Name
    const safeName = (config.userName || 'Candidate').trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');

    // 2. Extract Context (Company/Role) from first line of JD
    // Get first non-empty line
    const firstLine = jobDescription.split('\n').find(line => line.trim().length > 0) || 'Job_Application';
    // Take max 30 chars, replace spaces with _, remove weird chars
    const safeContext = firstLine.substring(0, 30).trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');

    // 3. Document Type
    const docType = outputTab === 'letter' ? 'Cover_Letter' : 'Resume';

    // Format: Name_Company_Type.pdf
    const filename = `${safeName}_${safeContext}_${docType}.pdf`;

    downloadAsPDF(content, config, filename);
  };

  const handleClear = () => {
    if (confirm(`Are you sure you want to clear the ${outputTab === 'letter' ? 'Cover Letter' : 'Resume'} output and Job Description?`)) {
      setJobDescription('');
      if (outputTab === 'letter') setGeneratedLetter('');
      else setGeneratedResume('');
      
      setExtractedEmail(null);
      setInterviewPrep(null);
      setActiveTab('jd');
    }
  };

  const restoreHistory = (item: HistoryItem) => {
    setGeneratedLetter(item.content);
    setOutputTab('letter');
    setIsHistoryOpen(false);
    showToast('Restored from history', 'info');
  };

  const deleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  const charCount = activeTab === 'jd' ? jobDescription.length : resumeText.length;

  if (view === 'landing') {
    return <LandingPage onGetStarted={() => setView('app')} />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#050505] flex flex-col text-zinc-800 dark:text-zinc-200 font-sans transition-colors duration-300">
      
      {/* Header */}
      <header className="bg-white/80 dark:bg-black/50 border-b border-zinc-200 dark:border-white/5 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('landing')}>
             <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded flex items-center justify-center text-white dark:text-black shadow-lg transition-transform group-hover:scale-105">
               <span className="font-bold">F</span>
             </div>
             <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
               FLUX<span className="text-zinc-400 font-normal">CAREER</span>
             </span>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className="p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/5 rounded-full transition-colors"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1"></div>
            <button 
              onClick={() => setIsHistoryOpen(true)} 
              className="p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/5 rounded-full transition-colors relative"
              title="History"
            >
              <History size={18} />
              {history.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border border-white dark:border-black"></span>}
            </button>
            <button 
              onClick={() => setIsConfigOpen(true)} 
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-white/10"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-400 to-red-500 flex items-center justify-center text-[10px] text-white font-bold">
                 {config.userName ? config.userName.charAt(0) : 'U'}
              </div>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hidden sm:block">
                {config.userName ? config.userName.split(' ')[0] : 'Profile'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 w-full max-w-[1800px] mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Inputs (25%) */}
        <section className="flex flex-col gap-4 h-[calc(100vh-140px)] min-h-[600px] lg:col-span-1">
          
          <div className="bg-white dark:bg-[#0A0A0A] rounded-xl border border-zinc-200 dark:border-white/5 flex-1 flex flex-col overflow-hidden shadow-sm transition-colors">
            
            {/* Input Tabs */}
            <div className="flex border-b border-zinc-100 dark:border-white/5">
              <button 
                onClick={() => setActiveTab('jd')}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wide flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'jd' 
                    ? 'text-zinc-900 dark:text-white border-b-2 border-orange-500 bg-zinc-50 dark:bg-white/5' 
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                <Briefcase size={14} /> Job Context
              </button>
              <button 
                onClick={() => setActiveTab('resume')}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wide flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'resume' 
                    ? 'text-zinc-900 dark:text-white border-b-2 border-purple-500 bg-zinc-50 dark:bg-white/5' 
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                <FileUser size={14} /> My Resume
              </button>
            </div>
            
            <div className="relative flex-1 group bg-zinc-50/50 dark:bg-black/20">
              {activeTab === 'jd' && extractedEmail && (
                 <div className="absolute top-3 right-4 z-10 animate-fade-in">
                  <div className="flex items-center gap-1.5 text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">
                    <Mail size={10} />
                    <span>Email Detected</span>
                  </div>
                </div>
              )}

              <textarea
                value={activeTab === 'jd' ? jobDescription : resumeText}
                onChange={(e) => activeTab === 'jd' ? setJobDescription(e.target.value) : setResumeText(e.target.value)}
                placeholder={activeTab === 'jd' ? "Paste job description..." : "Paste your resume text..."}
                className="w-full h-full p-5 resize-none outline-none text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 bg-transparent selection:bg-orange-500/20"
                spellCheck={false}
              />
            </div>
            
            <div className="px-4 py-3 border-t border-zinc-100 dark:border-white/5 bg-white dark:bg-[#0A0A0A] flex justify-between items-center text-[10px] uppercase tracking-wider text-zinc-400">
              <span>{charCount} chars</span>
              <button 
                onClick={() => activeTab === 'jd' ? setJobDescription('') : setResumeText('')} 
                className="hover:text-red-500 transition-colors flex items-center gap-1"
              >
                <Trash2 size={12} /> Clear
              </button>
            </div>
          </div>

          {/* Controls & Generate */}
          <div className="space-y-3">
             {outputTab === 'letter' && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <select 
                      value={selectedTone}
                      onChange={(e) => setSelectedTone(e.target.value)}
                      className="w-full appearance-none bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 focus:border-orange-500 outline-none transition-colors"
                    >
                      {TONES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 text-zinc-400 pointer-events-none" size={12} />
                  </div>
                  <div className="relative">
                    <select 
                      value={selectedLength}
                      onChange={(e) => setSelectedLength(e.target.value)}
                      className="w-full appearance-none bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 focus:border-orange-500 outline-none transition-colors"
                    >
                      {LENGTHS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 text-zinc-400 pointer-events-none" size={12} />
                  </div>
                </div>
             )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !jobDescription}
              className={`
                w-full py-3.5 rounded-lg font-bold text-sm tracking-wide shadow-lg flex items-center justify-center gap-2 transition-all 
                ${isGenerating || !jobDescription 
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed shadow-none border border-transparent' 
                  : outputTab === 'resume'
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-black border border-zinc-800 dark:border-white hover:bg-purple-600 dark:hover:bg-purple-200 hover:border-purple-600 dark:hover:border-purple-200 hover:text-white dark:hover:text-purple-900'
                    : 'bg-zinc-900 dark:bg-white text-white dark:text-black border border-zinc-800 dark:border-white hover:bg-orange-600 dark:hover:bg-orange-200 hover:border-orange-600 dark:hover:border-orange-200 hover:text-white dark:hover:text-orange-900'}
              `}
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {outputTab === 'resume' ? 'GENERATE RESUME' : 'GENERATE LETTER'}
            </button>
          </div>
        </section>

        {/* Right Column: Preview (75%) */}
        <section className="flex flex-col gap-4 h-[calc(100vh-140px)] min-h-[600px] lg:col-span-3">
          
          <div className="bg-zinc-100 dark:bg-[#0A0A0A] rounded-xl flex-1 flex flex-col overflow-hidden relative transition-colors border border-zinc-200 dark:border-white/5">
            
            {/* Toolbar */}
            <div className="bg-white dark:bg-[#0A0A0A] border-b border-zinc-200 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center z-10 px-4">
               <div className="flex gap-1">
                  <button 
                    onClick={() => setOutputTab('letter')}
                    className={`px-4 py-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors flex items-center gap-2 ${outputTab === 'letter' ? 'border-orange-500 text-zinc-900 dark:text-white' : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                  >
                    Cover Letter
                  </button>
                  <button 
                    onClick={() => setOutputTab('resume')}
                    className={`px-4 py-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors flex items-center gap-2 ${outputTab === 'resume' ? 'border-purple-500 text-zinc-900 dark:text-white' : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                  >
                    Tailored Resume
                  </button>
               </div>

              <div className="flex items-center gap-2 py-2">
                {outputTab === 'letter' && generatedLetter && (
                  <button 
                    onClick={handleInterviewPrep}
                    className="mr-3 text-xs font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors border border-blue-200 dark:border-blue-500/20"
                  >
                    Interview Prep
                  </button>
                )}
                
                <button 
                  onClick={() => handleCopy(outputTab === 'letter' ? generatedLetter : generatedResume)} 
                  disabled={outputTab === 'letter' ? !generatedLetter : !generatedResume} 
                  className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors" 
                  title="Copy"
                >
                  <Copy size={16} />
                </button>
                <button 
                  onClick={handleDownloadPdf} 
                  disabled={outputTab === 'letter' ? !generatedLetter : !generatedResume} 
                  className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors" 
                  title="Download PDF"
                >
                  <FileDown size={16} />
                </button>
              </div>
            </div>

            {/* Paper Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center items-start bg-zinc-100 dark:bg-[#111] scroll-smooth">
              <div className="w-full max-w-[210mm] bg-white text-black shadow-2xl min-h-[297mm] p-[10mm] sm:p-[15mm] flex flex-col transition-all duration-500 animate-slide-up">
                
                {/* Visual Header */}
                <div className="mb-6">
                  <h1 className="text-3xl uppercase tracking-[0.2em] font-bold text-zinc-900 mb-3">
                    {config.userName || 'YOUR NAME'}
                  </h1>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
                    {config.userEmail && <span>{config.userEmail}</span>}
                    {config.userPhone && <span>• {config.userPhone}</span>}
                    {config.userLinkedIn && <span>• {config.userLinkedIn}</span>}
                  </div>
                </div>

                <div className="w-full h-px bg-zinc-900 mb-8"></div>

                {/* Content */}
                <div className="flex-1 relative min-h-[500px]">
                  {outputTab === 'letter' ? (
                    generatedLetter ? (
                       <textarea 
                          ref={textareaRef}
                          value={generatedLetter}
                          onChange={(e) => setGeneratedLetter(e.target.value)}
                          className="w-full h-full resize-none outline-none border-none bg-transparent text-[10.5pt] leading-[1.6] font-sans text-justify text-zinc-800 placeholder:text-zinc-300 overflow-hidden min-h-full"
                          spellCheck={false}
                       />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-200 gap-4 pointer-events-none">
                        <FileText size={48} />
                      </div>
                    )
                  ) : (
                    generatedResume ? (
                      <div 
                        ref={resumeRef}
                        contentEditable
                        onBlur={(e) => setGeneratedResume(e.currentTarget.innerHTML)}
                        dangerouslySetInnerHTML={{ __html: generatedResume }}
                        className="w-full h-full outline-none border-none bg-transparent text-[10pt] leading-snug font-sans text-zinc-800 resume-content"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-200 gap-4 pointer-events-none">
                        <FileBadge size={48} />
                      </div>
                    )
                  )}
                </div>

              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-zinc-200 dark:border-white/5 bg-white dark:bg-[#0A0A0A] flex justify-between items-center z-10">
               <button
                onClick={handleClear}
                className="flex items-center gap-2 px-4 py-2 rounded text-xs font-bold uppercase tracking-wide text-zinc-500 hover:text-red-500 transition-colors"
              >
                Clear All
              </button>

              {outputTab === 'letter' && (
                <button
                  onClick={initiateSend}
                  disabled={!generatedLetter || isSending}
                  className={`
                    flex items-center gap-2 px-6 py-2.5 rounded text-xs font-bold uppercase tracking-wide transition-colors border
                    ${!generatedLetter 
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-transparent cursor-not-allowed' 
                      : 'bg-white dark:bg-black text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-700 hover:border-green-500 dark:hover:border-green-500 hover:text-green-600 dark:hover:text-green-400'}
                  `}
                >
                  {isSending ? <Loader2 size={14} className="animate-spin" /> : config.googleClientId ? <Lock size={14} /> : <Send size={14} />}
                  {isSending ? 'Sending...' : 'Sync to Sheets'}
                </button>
              )}
            </div>
          </div>
        </section>

      </main>

      {/* History Panel */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" onClick={() => setIsHistoryOpen(false)}>
           <div 
             className="w-full max-w-sm bg-white dark:bg-[#0A0A0A] h-full shadow-2xl flex flex-col border-l border-zinc-200 dark:border-white/10 animate-slide-left"
             onClick={e => e.stopPropagation()}
           >
             <div className="p-6 border-b border-zinc-100 dark:border-white/5 flex justify-between items-center">
               <h2 className="font-bold text-sm uppercase tracking-widest text-zinc-900 dark:text-white">History</h2>
               <button onClick={() => setIsHistoryOpen(false)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                 <X size={20} />
               </button>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-3">
               {history.map(item => (
                 <div 
                   key={item.id} 
                   onClick={() => restoreHistory(item)}
                   className="p-4 bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 rounded border border-zinc-200 dark:border-white/5 cursor-pointer group transition-all"
                 >
                   <div className="flex justify-between items-start mb-2">
                     <span className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 line-clamp-1">{item.jobTitle}</span>
                     <button onClick={(e) => deleteHistory(item.id, e)} className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                   </div>
                   <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono">
                     {new Date(item.timestamp).toLocaleDateString()}
                   </div>
                 </div>
               ))}
             </div>
           </div>
        </div>
      )}

      {/* Config Modal */}
      <ConfigPanel 
        config={config} 
        isOpen={isConfigOpen} 
        onClose={() => setIsConfigOpen(false)} 
        onUpdate={(newConfig) => setConfig(prev => ({ ...prev, ...newConfig }))}
      />

      {/* Toast */}
      <Toast toast={toast} onClose={() => setToast(prev => ({ ...prev, show: false }))} />

      {/* Interview Prep Modal */}
      {showInterviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4" onClick={() => setShowInterviewModal(false)}>
          <div className="w-full max-w-2xl bg-white dark:bg-[#0A0A0A] rounded-xl shadow-2xl border border-zinc-200 dark:border-white/10 max-h-[85vh] flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-100 dark:border-white/5 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white flex items-center gap-2">
                <BrainCircuit size={18} className="text-blue-500" /> Interview Intelligence
              </h3>
              <button onClick={() => setShowInterviewModal(false)}><X size={20} className="text-zinc-400" /></button>
            </div>
            <div className="p-8 overflow-y-auto flex-1 bg-zinc-50/50 dark:bg-black/20">
              {isPrepGenerating ? (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                  <Loader2 size={32} className="animate-spin mb-4" />
                  <p className="text-xs uppercase tracking-widest">Analyzing Requirements...</p>
                </div>
              ) : (
                <div className="prose dark:prose-invert prose-sm max-w-none text-zinc-700 dark:text-zinc-300">
                  {interviewPrep}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .resume-content h3 {
          text-transform: uppercase;
          font-weight: 700;
          font-size: 10pt;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #000;
          margin-top: 12px;
          margin-bottom: 6px;
          padding-bottom: 2px;
          color: #000;
          line-height: 1.1;
        }
        .resume-content ul {
          margin-left: 14px;
          margin-bottom: 6px;
          padding-left: 0;
          list-style-type: disc;
        }
        .resume-content li {
          margin-bottom: 2px;
          padding-left: 2px;
        }
        .resume-content p {
          margin-bottom: 4px;
        }
        .resume-content strong {
          font-weight: 600;
          color: #000;
        }
      `}</style>
    </div>
  );
};

export default App;
