import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  isCurrent?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showHomeIcon?: boolean;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className = "",
  showHomeIcon = true
}) => {
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center space-x-1.5 overflow-x-auto whitespace-nowrap py-1 scrollbar-none text-xs text-slate-400 ${className}`}
    >
      {showHomeIcon && items[0]?.label !== 'Home' && items[0]?.label !== 'Dashboard' && (
        <span className="flex items-center space-x-1 shrink-0 text-slate-500">
          <Home className="w-3.5 h-3.5" />
        </span>
      )}

      {items.map((item, index) => {
        const isLast = index === items.length - 1 || item.isCurrent;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0 mx-0.5" />
            )}

            {isLast ? (
              <span
                className="font-bold text-slate-100 truncate max-w-[180px] sm:max-w-xs bg-white/5 px-2 py-0.5 rounded-lg border border-white/10"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : item.onClick ? (
              <button
                type="button"
                onClick={item.onClick}
                className="text-slate-400 hover:text-indigo-300 hover:underline transition font-medium focus:outline-none focus:text-indigo-300"
              >
                {item.label}
              </button>
            ) : (
              <span className="text-slate-400 font-medium">
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
