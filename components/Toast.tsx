import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { ToastState } from '../types';

interface ToastProps {
  toast: ToastState;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show, onClose]);

  if (!toast.show) return null;

  const bgColors = {
    success: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
    error: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20',
    info: 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
  };

  const icons = {
    success: <CheckCircle className="text-emerald-500 dark:text-emerald-400" size={18} />,
    error: <AlertCircle className="text-red-500 dark:text-red-400" size={18} />,
    info: <Info className="text-zinc-500 dark:text-zinc-400" size={18} />
  };

  const textColors = {
    success: 'text-emerald-800 dark:text-emerald-200',
    error: 'text-red-800 dark:text-red-200',
    info: 'text-zinc-800 dark:text-zinc-200'
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-5 py-3 rounded border shadow-xl backdrop-blur-md animate-slide-up ${bgColors[toast.type]}`}>
      <div className="flex-shrink-0">
        {icons[toast.type]}
      </div>
      <p className={`text-xs font-medium ${textColors[toast.type]}`}>
        {toast.message}
      </p>
      <button onClick={onClose} className="ml-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;