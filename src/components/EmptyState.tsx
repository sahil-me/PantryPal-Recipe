import React from 'react';
import { LucideIcon, RotateCcw, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon | React.ReactNode;
  title: string;
  description: string;
  suggestions?: string[];
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  retryLabel?: string;
  onRetry?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: IconOrNode,
  title,
  description,
  suggestions,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  retryLabel,
  onRetry,
}) => {
  const renderIcon = () => {
    if (!IconOrNode) return <Sparkles className="w-8 h-8 text-[#D4AF37]" />;
    if (React.isValidElement(IconOrNode)) {
      return IconOrNode;
    }
    const IconComp = IconOrNode as any;
    return <IconComp className="w-8 h-8 text-[#D4AF37]" />;
  };

  return (
    <div className="bg-[#1A1918] border border-[#2A2724] rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl max-w-2xl mx-auto my-6 animate-in fade-in duration-300">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-[#1E1D1B] border border-[#D4AF37]/30 flex items-center justify-center shadow-lg">
        {renderIcon()}
      </div>

      <div className="space-y-2 max-w-lg mx-auto">
        <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#F5F2EB]">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-[#C2BCB2] leading-relaxed">
          {description}
        </p>
      </div>

      {suggestions && suggestions.length > 0 && (
        <div className="bg-[#1E1D1B] border border-[#2A2724] rounded-2xl p-4 max-w-md mx-auto text-left space-y-2">
          <p className="text-xs font-serif font-bold text-[#D4AF37] uppercase tracking-wider">
            Helpful Suggestions
          </p>
          <ul className="space-y-1.5 text-xs text-[#C2BCB2]">
            {suggestions.map((suggestion, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#D4AF37] font-bold">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-5 py-3 bg-[#23211E] hover:bg-[#2A2724] border border-[#D4AF37]/40 text-[#D4AF37] font-bold text-xs rounded-2xl transition-all cursor-pointer flex items-center gap-2 shadow-md hover:border-[#D4AF37]"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{retryLabel || 'Try Again'}</span>
          </button>
        )}

        {onAction && actionLabel && (
          <button
            onClick={onAction}
            className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black font-extrabold text-xs rounded-2xl transition-all cursor-pointer shadow-lg shadow-[#D4AF37]/15 hover:brightness-110 flex items-center gap-2"
          >
            <span>{actionLabel}</span>
          </button>
        )}

        {onSecondaryAction && secondaryActionLabel && (
          <button
            onClick={onSecondaryAction}
            className="px-5 py-3 bg-[#1E1D1B] hover:bg-[#23211E] border border-[#2A2724] hover:border-[#D4AF37]/40 text-[#F5F2EB] font-bold text-xs rounded-2xl transition-all cursor-pointer"
          >
            <span>{secondaryActionLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};
