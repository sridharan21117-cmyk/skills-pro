import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onStay: () => void;
  onLeave: () => void;
  title?: string;
  message?: string;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  onStay,
  onLeave,
  title = "Unsaved Changes",
  message = "You have unsaved changes that will be lost if you leave this page. Are you sure you want to proceed?"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl w-full max-w-md p-6 shadow-2xl relative space-y-5 text-slate-100">
        
        <button
          onClick={onStay}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-2xl shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{title}</h3>
            <p className="text-xs text-amber-300 font-medium">Action Requires Confirmation</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10">
          {message}
        </p>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={onStay}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-slate-200 rounded-xl text-xs font-bold transition border border-white/10"
          >
            Stay & Continue Editing
          </button>
          <button
            onClick={onLeave}
            className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-rose-900/30 border border-white/20"
          >
            Discard & Leave
          </button>
        </div>

      </div>
    </div>
  );
};
