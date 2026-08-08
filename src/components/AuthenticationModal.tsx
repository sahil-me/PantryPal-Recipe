import React, { useState, useEffect, useRef } from 'react';
import { ChefHat, X, Mail, Sparkles, Loader2 } from 'lucide-react';
import { AuthAlert } from './AuthAlert';
import { FormattedAuthError, formatAuthError } from '../utils/authErrors';

export type AuthModalMode = 'sign-in' | 'sign-up' | 'signin' | 'signup';

export interface AuthenticationModalProps {
  isOpen: boolean;
  initialMode?: AuthModalMode;
  onClose: () => void;
  customMessage?: string;
  onGoogleSignIn: () => Promise<any> | void;
  onEmailSignUp: () => void;
  onEmailSignIn: () => void;
}

// Helper to normalize mode strings ('signin' -> 'sign-in', etc.)
const normalizeMode = (mode?: AuthModalMode | string): 'sign-in' | 'sign-up' => {
  if (mode === 'signin' || mode === 'sign-in') return 'sign-in';
  return 'sign-up';
};

interface HeaderContentProps {
  mode: 'sign-in' | 'sign-up';
  customMessage?: string;
}

interface FooterContentProps {
  mode: 'sign-in' | 'sign-up';
  isSubmitting: boolean;
  onSwitchMode: (newMode: 'sign-in' | 'sign-up') => void;
}

// Sub-component: Modular Header section displaying mode badge, title, subtitle & optional message
const ModalHeaderContent: React.FC<HeaderContentProps> = ({ mode, customMessage }) => {
  const isSignIn = mode === 'sign-in';

  return (
    <div key={mode} className="space-y-3 pr-8 pb-1 sm:pb-2 animate-in fade-in duration-150">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#23211E] border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold uppercase tracking-wider">
        <Sparkles className="w-3.5 h-3.5 text-[#F3C64F]" />
        {isSignIn ? 'WELCOME BACK' : 'JOIN PANTRYPAL'}
      </div>
      
      <div className="flex items-center gap-3 pt-1">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black flex items-center justify-center font-bold shadow-lg shrink-0">
          <ChefHat className="w-7 h-7 text-black" />
        </div>
        <div>
          <h2 id="auth-modal-title" className="text-xl font-serif font-bold text-[#F5F2EB]">
            {isSignIn ? 'Sign in to PantryPal' : 'Create Your Free Account'}
          </h2>
          <p className="text-xs text-[#D4AF37] font-semibold mt-0.5 leading-relaxed">
            {isSignIn
              ? 'Welcome back! Sign in to access your pantry, favorites, weekly planner, and personalized recipe recommendations.'
              : 'Save recipes, sync your pantry, and plan meals across devices.'}
          </p>
        </div>
      </div>

      {customMessage && (
        <p className="text-xs sm:text-sm text-[#C2BCB2] leading-relaxed pt-1">
          {customMessage}
        </p>
      )}
    </div>
  );
};

// Sub-component: Modular Footer section displaying trust indicator and smooth mode switch button
const ModalFooterContent: React.FC<FooterContentProps> = ({ mode, isSubmitting, onSwitchMode }) => {
  const isSignIn = mode === 'sign-in';

  return (
    <div className="space-y-3 pt-1">
      {/* Helper / Trust text */}
      <p className="text-[11px] text-[#A39C90] text-center font-medium pt-1">
        {isSignIn
          ? '✓ Your pantry syncs automatically across devices.'
          : '✓ Free forever • No credit card required'}
      </p>

      {/* Switch mode footer link */}
      <div className="pt-3 text-center text-xs text-[#A39C90] border-t border-[#2A2724]">
        {isSignIn ? (
          <>
            <span>Don't have an account? </span>
            <button
              type="button"
              onClick={() => onSwitchMode('sign-up')}
              disabled={isSubmitting}
              className="font-bold text-[#D4AF37] hover:underline cursor-pointer ml-1 disabled:opacity-50"
            >
              Create Free Account
            </button>
          </>
        ) : (
          <>
            <span>Already have an account? </span>
            <button
              type="button"
              onClick={() => onSwitchMode('sign-in')}
              disabled={isSubmitting}
              className="font-bold text-[#D4AF37] hover:underline cursor-pointer ml-1 disabled:opacity-50"
            >
              Sign In
            </button>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * Reusable Authentication Modal component supporting 'sign-in' and 'sign-up' modes.
 */
export const AuthenticationModal: React.FC<AuthenticationModalProps> = ({
  isOpen,
  initialMode = 'sign-up',
  onClose,
  customMessage,
  onGoogleSignIn,
  onEmailSignUp,
  onEmailSignIn
}) => {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>(normalizeMode(initialMode));
  const [error, setError] = useState<FormattedAuthError | string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingType, setSubmittingType] = useState<'google' | 'email' | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setMode(normalizeMode(initialMode));
    setError(null);

    // Store element that triggered modal to restore focus on exit
    previousFocusRef.current = document.activeElement as HTMLElement;

    if (modalRef.current) {
      modalRef.current.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setError(null);
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, initialMode, onClose]);

  if (!isOpen) return null;

  const handleGoogleClick = async () => {
    if (isSubmitting) return;
    setError(null);
    setSubmittingType('google');
    setIsSubmitting(true);
    try {
      const res: any = await onGoogleSignIn();
      if (res && !res.success && res.errorFormatted) {
        if (!res.errorFormatted.isCancelled) {
          setError(res.errorFormatted);
        }
      }
    } catch (err: any) {
      const formatted = formatAuthError(err);
      if (!formatted.isCancelled) {
        setError(formatted.message || 'Failed to sign in with Google. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
      setSubmittingType(null);
    }
  };

  const handleEmailClick = async () => {
    if (isSubmitting) return;
    setError(null);
    setSubmittingType('email');
    setIsSubmitting(true);
    try {
      if (mode === 'sign-in') {
        await onEmailSignIn();
      } else {
        await onEmailSignUp();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
      setSubmittingType(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          setError(null);
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-md bg-[#1A1918] border border-[#D4AF37]/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-left space-y-5 overflow-hidden animate-in zoom-in-95 duration-200 outline-none"
        aria-modal="true"
        role="dialog"
        aria-labelledby="auth-modal-title"
      >
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            setError(null);
            onClose();
          }}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-2 text-[#A39C90] hover:text-[#F5F2EB] hover:bg-[#23211E] rounded-xl transition-colors cursor-pointer disabled:opacity-50 z-10"
          title="Close modal"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Content Sub-component */}
        <ModalHeaderContent mode={mode} customMessage={customMessage} />

        {/* Error Alert Display */}
        {error && (
          <AuthAlert
            error={error}
            onDismiss={() => setError(null)}
            onRetry={handleGoogleClick}
          />
        )}

        {/* Actions Container */}
        <div className="space-y-3 pt-2 sm:pt-3">
          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleClick}
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-[#1E1D1B] hover:bg-[#23211E] border border-[#D4AF37]/50 hover:border-[#D4AF37] text-[#F5F2EB] font-bold text-xs rounded-2xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submittingType === 'google' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* OR Divider */}
          <div className="relative flex items-center justify-center my-1">
            <div className="border-t border-[#2A2724] w-full" />
            <span className="bg-[#1A1918] px-3 text-[11px] font-bold text-[#A39C90] uppercase tracking-widest shrink-0">
              OR
            </span>
            <div className="border-t border-[#2A2724] w-full" />
          </div>

          {/* Email Primary Button */}
          <button
            onClick={handleEmailClick}
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] hover:brightness-110 text-black font-extrabold text-xs rounded-2xl transition-all cursor-pointer shadow-lg shadow-[#D4AF37]/15 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submittingType === 'email' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 text-black" />
                <span>Continue with Email & Password</span>
              </>
            )}
          </button>

          {/* Footer Content Sub-component */}
          <ModalFooterContent
            mode={mode}
            isSubmitting={isSubmitting}
            onSwitchMode={(newMode) => {
              setError(null);
              setMode(newMode);
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Export AuthModal alias for full backwards compatibility
export const AuthModal = AuthenticationModal;
