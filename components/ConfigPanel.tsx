
import React, { useState } from 'react';
import { X, UserCircle, Phone, Linkedin, Trash2, Key, Cpu, Eye, EyeOff } from 'lucide-react';
import { AppConfig } from '../types';

interface ConfigPanelProps {
  config: AppConfig;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (newConfig: AppConfig) => void;
}

const MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Recommended)', desc: 'Fast, efficient, great for general tasks' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', desc: 'Fastest, lowest latency' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3.0 Pro', desc: 'High intelligence for complex reasoning' },
];

const ConfigPanel: React.FC<ConfigPanelProps> = ({ 
  config, 
  isOpen, 
  onClose, 
  onUpdate
}) => {
  const [showKey, setShowKey] = useState(false);

  const handleChange = (field: keyof AppConfig, value: string) => {
    onUpdate({ ...config, [field]: value });
  };

  if (!isOpen) return null;

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

        <div className="space-y-8 flex-1 overflow-y-auto pr-2">
          
          {/* AI Settings Section */}
          <section>
             <h3 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Cpu size={14} /> AI Configuration
             </h3>
             <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Gemini API Key</label>
                  <div className="relative">
                    <input
                      type={showKey ? "text" : "password"}
                      value={config.apiKey || ''}
                      onChange={(e) => handleChange('apiKey', e.target.value)}
                      className="w-full p-3 pr-10 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded focus:border-orange-500 outline-none text-zinc-900 dark:text-white transition-colors text-sm font-mono"
                      placeholder="Enter your API Key..."
                    />
                    <button 
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                      {showKey ? <EyeOff size={14}/> : <Eye size={14}/>}
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1">Key is stored locally in your browser.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">AI Model</label>
                  <div className="relative">
                    <select
                      value={config.model || 'gemini-2.5-flash'}
                      onChange={(e) => handleChange('model', e.target.value)}
                      className="w-full p-3 appearance-none bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded focus:border-orange-500 outline-none text-zinc-900 dark:text-white transition-colors text-sm"
                    >
                      {MODELS.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1">
                    {MODELS.find(m => m.id === config.model)?.desc || 'Select a model'}
                  </p>
                </div>
             </div>
          </section>

          <hr className="border-zinc-100 dark:border-white/5" />

          {/* User Profile Section */}
          <section>
            <h3 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2">
               <UserCircle size={14} /> User Profile
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-white/5 p-3 rounded border border-zinc-200 dark:border-white/5 leading-relaxed mb-4">
              This information auto-populates the header of your generated documents.
            </p>

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
