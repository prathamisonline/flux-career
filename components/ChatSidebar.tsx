

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Copy, Check, ArrowRight, FileText, FileBadge, MessageSquare, RefreshCw } from 'lucide-react';
import { ChatMessage } from '../types';
import { copyToClipboard, parseAIResponse } from '../services/utils';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isTyping: boolean;
  onApplyContent: (content: string) => void;
  activeDocument: 'letter' | 'resume';
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  isOpen, 
  onClose, 
  messages, 
  onSendMessage, 
  isTyping,
  onApplyContent,
  activeDocument 
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  const handleQuickAction = (action: string) => {
    onSendMessage(action);
  };

  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[400px] bg-white dark:bg-[#0A0A0A] shadow-2xl border-l border-zinc-200 dark:border-white/10 flex flex-col animate-slide-left transition-colors">
      
      {/* Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-white/5 flex justify-between items-center bg-zinc-50 dark:bg-black/20">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded bg-zinc-200 dark:bg-white/10 text-zinc-700 dark:text-zinc-300`}>
            {activeDocument === 'letter' ? <FileText size={16} /> : <FileBadge size={16} />}
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white">AI Copilot</h2>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wide">
              Editing: {activeDocument === 'letter' ? 'Cover Letter' : 'Resume'}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-[#0A0A0A]">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400 space-y-4 opacity-50">
            <MessageSquare size={48} />
            <p className="text-sm text-center max-w-[200px]">
              Chat with Flux AI to refine your {activeDocument === 'letter' ? 'cover letter' : 'resume'}.
            </p>
          </div>
        )}
        
        {messages.map((msg) => {
           // Parse content to check for hidden document updates
           const { hasDocument, content: docContent, displayMessage } = parseAIResponse(msg.content);

           return (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`
                  max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm
                  ${msg.role === 'user' 
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-black rounded-tr-none' 
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-white/10 rounded-tl-none'}
                `}
              >
                <div className="whitespace-pre-wrap">{msg.role === 'user' ? msg.content : displayMessage}</div>
                
                {/* Document Update Action Block */}
                {msg.role === 'assistant' && hasDocument && (
                  <div className="mt-3 pt-2 border-t border-black/5 dark:border-white/5">
                    <div className="flex items-center justify-between gap-2 bg-emerald-500/10 rounded p-2 border border-emerald-500/20">
                      <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        <RefreshCw size={12} />
                        <span>Document Updated</span>
                      </div>
                      <button 
                        onClick={() => onApplyContent(docContent)}
                        className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wide rounded transition-colors shadow-sm"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}

                {/* Standard Actions (Copy) */}
                {msg.role === 'assistant' && !hasDocument && (
                  <div className="mt-3 pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleCopy(displayMessage)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                      title="Copy"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
           );
        })}
        
        {isTyping && (
           <div className="flex justify-start">
             <div className="bg-zinc-100 dark:bg-zinc-900 p-3 rounded-2xl rounded-tl-none flex gap-1">
               <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></span>
               <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce delay-75"></span>
               <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce delay-150"></span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length < 2 && (
        <div className="px-4 pb-2">
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2 font-bold">Quick Actions</p>
          <div className="flex flex-wrap gap-2">
            {['Fix Grammar', 'Make it shorter', 'More professional tone', 'Add bullet points'].map(action => (
              <button
                key={action}
                onClick={() => handleQuickAction(action)}
                className="px-3 py-1.5 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:border-orange-500 dark:hover:border-orange-500 rounded text-xs text-zinc-600 dark:text-zinc-300 transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-[#0A0A0A] border-t border-zinc-200 dark:border-white/5">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI to refine..."
            className="w-full pl-4 pr-12 py-3 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 rounded-full focus:border-orange-500 outline-none text-sm text-zinc-900 dark:text-white transition-colors"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-2 p-1.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isTyping ? <Sparkles size={16} className="animate-spin" /> : <ArrowRight size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatSidebar;
