import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface AndroidToastProps {
  message: string | null;
  onDismiss: () => void;
}

export const AndroidToast: React.FC<AndroidToastProps> = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="fixed top-12 inset-x-0 z-50 flex justify-center px-4 pointer-events-none animate-bounce-short">
      <div className="pointer-events-auto bg-[#141413]/95 backdrop-blur-md text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-xl border border-white/10 flex items-center space-x-2.5 max-w-sm">
        <CheckCircle2 className="w-4 h-4 text-[#FF5722] shrink-0" />
        <span className="truncate">{message}</span>
        <button
          onClick={onDismiss}
          className="w-5 h-5 rounded-full hover:bg-white/15 flex items-center justify-center text-white/70"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
