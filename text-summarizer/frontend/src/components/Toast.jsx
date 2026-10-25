import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const { message, type } = toast;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-indigo-400 shrink-0" />
  };

  const borders = {
    success: 'border-emerald-800/80 bg-emerald-950/90 text-emerald-200',
    error: 'border-red-800/80 bg-red-950/90 text-red-200',
    info: 'border-indigo-800/80 bg-indigo-950/90 text-indigo-200'
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md text-xs sm:text-sm font-medium ${borders[type] || borders.info}`}>
        {icons[type] || icons.info}
        <span className="pr-2">{message}</span>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
