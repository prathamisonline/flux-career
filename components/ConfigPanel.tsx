
import React, { useState } from 'react';
import { X, UserCircle, Eye, EyeOff, Cpu, Box, Key, Zap } from 'lucide-react';
import { AppConfig, AIProvider } from '../types';

interface ConfigPanelProps {
  config: AppConfig;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (newConfig: AppConfig) => void;
}

// Model Definitions
const PROVIDERS: { id: AIProvider; name: string; icon: any }[] = [
  { id: 'gemini', name: 'Google Gemini', icon: Zap },
  { id: 'openai', name: 'OpenAI', icon: Box },
  { id: 'openrouter', name: 'OpenRouter (Claude/DeepSeek)', icon: Cpu },
];

const MODELS: Record<AIProvider, { id: string; name: string }[]> = {
  gemini: [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Recommended)' },
    { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite' },
    { id: 'gemini-3-pro-preview', name: 'Gemini 3.0 Pro' },
  ],
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o (Best Quality)' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Faster)' },
  ],
  openrouter: [
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
    { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku' },
    { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1' },
    { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B' },
    { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash (via OR)' },
  ]
};

const ConfigPanel: React.FC<ConfigPanelProps> = ({ 
  config, 
  isOpen, 
  onClose, 
  onUpdate
}) => {
  const [showKey, setShowKey] = useState(false);

  // Helper to handle provider switch and set default model for that provider
  const handleProviderChange = (provider: AIProvider) => {
    onUpdate({
      ...config,
      provider,
      model: MODELS[provider][0].id
    });
  };

  const getKeyField = (provider: AIProvider): keyof AppConfig => {
    switch (provider) {
      case 'gemini': return 'geminiApiKey';
      case 'openai': return 'openAiApiKey';
      case 'openrouter': return 'openRouterApiKey';
    }
  };

  const handleChange = (field: keyof AppConfig, value: string) => {
    onUpdate({ ...config, [field]: value });
  };

  if (!isOpen) return null;

  const currentKeyField = getKeyField(config.provider || 'gemini');
  const currentKeyValue = config[currentKeyField] as string;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-white dark:bg-[#0A0A0A] h-full shadow-2xl p-8 flex flex-col border-l border-zinc-200 dark:border-white/10" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white flex items-center gap-2">
            Settings
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          
          {/* AI Settings Section */}
          <section>
             <h3 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Cpu size={14} /> AI Engine
             </h3>
             
             <div className="space-y-5">
                {/* Provider Selector */}
                <div>
                   <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Provider</label>
                   <div className="grid grid-cols-3 gap-2">
                     {PROVIDERS.map((p) => {
                       const Icon = p.icon;
                       const isActive = (config.provider || 'gemini') === p.id;
                       return (
                         <button
                           key={p.id}
                           onClick={() => handleProviderChange(p.id)}
                           className={`flex flex-col items-center justify-center p-3 rounded border transition-all ${
                             isActive 
                               ? 'bg-zinc-900 dark:bg-white text-white dark:text-black border-transparent' 
                               : 'bg-zinc-50 dark:bg-white/5 text-zinc-500 border-zinc-200 dark:border-white/10 hover:border-zinc-400'
                           }`}
                         >
                           <Icon size={18} className="mb-1" />
                           <span className="text-[10px] font-bold">{p.name.split(' ')[0]}</span>
                         </button>
                       )
                     })}
                   </div>
                </div>

                {/* API Key Input (Dynamic) */}
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                    {config.provider === 'openai' ? 'OpenAI API Key' : config.provider === 'openrouter' ? 'OpenRouter Key' : 'Gemini API Key'}
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? "text" : "password"}
                      value={currentKeyValue || ''}
                      onChange={(e) => handleChange(currentKeyField, e.target.value)}
                      className="w-full p-3 pr-10 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded focus:border-orange-500 outline-none text-zinc-900 dark:text-white transition-colors text-sm font-mono"
                      placeholder="sk-..."
                    />
                    <button 
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                      {showKey ? <EyeOff size={14}/> : <Eye size={14}/>}
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1">
                    {config.provider === 'openrouter' 
                      ? 'Get key at openrouter.ai to use Claude/DeepSeek.'
                      : 'Key is stored locally in your browser.'}
                  </p>
                </div>

                {/* Model Selector */}
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Model</label>
                  <div className="relative">
                    <select
                      value={config.model || ''}
                      onChange={(e) => handleChange('model', e.target.value)}
                      className="w-full p-3 appearance-none bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded focus:border-orange-500 outline-none text-zinc-900 dark:text-white transition-colors text-sm"
                    >
                      {(MODELS[config.provider || 'gemini'] || []).map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
             </div>
          </section>

          <hr className="border-zinc-100 dark:border-white/5" />

          {/* User Profile Section */}
          <section>
            <h3 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2">
               <UserCircle size={14} /> User Profile
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  value={config.userName}
                  onChange={(e) => handleChange('userName', e.target.value)}
                  className="w-full p-3 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded focus:border-orange-500 outline-none text-zinc-900 dark:text-white transition-colors text-sm"
                  placeholder="Ex. Olivia Wilson"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Email</label>
                <input
                  type="email"
                  value={config.userEmail}
                  onChange={(e) => handleChange('userEmail', e.target.value)}
                  className="w-full p-3 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded focus:border-orange-500 outline-none text-zinc-900 dark:text-white transition-colors text-sm"
                  placeholder="hello@example.com"
                />
              </div>

               <div>
                 <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Phone</label>
                 <input
                   type="text"
                   value={config.userPhone || ''}
                   onChange={(e) => handleChange('userPhone', e.target.value)}
                   className="w-full p-3 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded focus:border-orange-500 outline-none text-zinc-900 dark:text-white transition-colors text-sm"
                   placeholder="+1 555-0123"
                 />
               </div>

               <div>
                 <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">LinkedIn URL</label>
                 <input
                   type="text"
                   value={config.userLinkedIn || ''}
                   onChange={(e) => handleChange('userLinkedIn', e.target.value)}
                   className="w-full p-3 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded focus:border-orange-500 outline-none text-zinc-900 dark:text-white transition-colors text-sm"
                   placeholder="linkedin.com/in/..."
                 />
               </div>
            </div>
          </section>
        </div>

        <div className="pt-6 border-t border-zinc-200 dark:border-white/10 mt-4">
          <button
            onClick={onClose}
            className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black py-3 rounded font-bold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigPanel;
