import React from 'react';
import { AlertCircle, RotateCcw, Send, X } from 'lucide-react';
import { FormattedAuthError, formatAuthError } from '../utils/authErrors';

interface AuthAlertProps {
  error: FormattedAuthError | string | null;
  onDismiss?: () => void;
  onRetry?: () => void;
  onResendEmail?: () => void;
  className?: string;
}

export const AuthAlert: React.FC<AuthAlertProps> = ({ error, onDismiss, onRetry, onResendEmail, className = '' }) => {
  if (!error) return null;

  const formatted: FormattedAuthError =
    typeof error === 'string' ? formatAuthError(error) : error;

  const isEmailVerificationError = formatted.code === 'auth/email-not-verified' || formatted.title.toLowerCase().includes('email verification');

  return (
    <div
      role="alert"
      className={`p-4 bg-red-950/60 border border-red-500/70 text-red-200 text-xs rounded-2xl shadow-xl flex items-start justify-between gap-3 animate-in fade-in zoom-in-95 duration-200 ${className}`}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="p-1.5 bg-red-900/60 rounded-xl border border-red-500/40 text-red-400 shrink-0 mt-0.5 shadow-sm">
          <AlertCircle className="w-4 h-4" />
        </div>
        <div className="space-y-1.5 min-w-0 flex-1">
          <h4 className="font-bold text-red-200 text-xs sm:text-sm tracking-tight">{formatted.title}</h4>
          <p className="text-[11px] sm:text-xs text-red-300/90 leading-relaxed break-words">{formatted.message}</p>
          {isEmailVerificationError && onResendEmail && (
            <button
              type="button"
              onClick={onResendEmail}
              className="mt-1 px-3 py-1.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-extrabold rounded-xl transition-all inline-flex items-center gap-1.5 text-xs cursor-pointer shadow-md"
            >
              <Send className="w-3.5 h-3.5 text-black" />
              <span>Resend Verification Email</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 self-start">
        {!isEmailVerificationError && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-2.5 py-1 bg-red-900/50 hover:bg-red-900/80 border border-red-500/50 text-red-200 rounded-xl transition-all flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer shadow-xs active:scale-95"
            title="Try Again"
          >
            <RotateCcw className="w-3 h-3 text-red-300" />
            <span>Try Again</span>
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="p-1 text-red-400 hover:text-white hover:bg-red-900/60 rounded-xl transition-all cursor-pointer"
            title="Dismiss error"
            aria-label="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
