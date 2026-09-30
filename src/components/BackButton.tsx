import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { UnsavedChangesModal } from './UnsavedChangesModal';

export interface BackButtonProps {
  label?: string;
  onClick?: () => void;
  fallback?: string | (() => void);
  isDirty?: boolean;
  onConfirmLeave?: () => void;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  label = "Back",
  onClick,
  fallback,
  isDirty = false,
  onConfirmLeave,
  className = ""
}) => {
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  const executeNavigation = () => {
    if (onConfirmLeave) {
      onConfirmLeave();
    }
    if (onClick) {
      onClick();
    } else if (window.history.length > 1) {
      window.history.back();
    } else if (fallback) {
      if (typeof fallback === 'function') {
        fallback();
      } else if (typeof fallback === 'string') {
        window.history.pushState({}, '', fallback);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDirty) {
      setShowUnsavedModal(true);
    } else {
      executeNavigation();
    }
  };

  const handleConfirmLeave = () => {
    setShowUnsavedModal(false);
    executeNavigation();
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center space-x-2 px-3.5 py-2 bg-white/5 hover:bg-white/10 active:bg-white/15 text-slate-200 hover:text-white border border-white/10 hover:border-white/20 rounded-2xl text-xs font-semibold backdrop-blur-md transition-all shadow-md group focus:outline-none focus:ring-2 focus:ring-indigo-500/50 touch-manipulation min-h-[40px] shrink-0 ${className}`}
        aria-label={label}
      >
        <ArrowLeft className="w-4 h-4 text-indigo-400 group-hover:-translate-x-1 transition-transform shrink-0" />
        <span className="truncate">{label}</span>
      </button>

      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onStay={() => setShowUnsavedModal(false)}
        onLeave={handleConfirmLeave}
      />
    </>
  );
};
