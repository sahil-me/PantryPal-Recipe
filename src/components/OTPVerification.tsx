import React, { useState, useEffect, useRef } from 'react';
import { Mail, ExternalLink, RefreshCw, ArrowLeft, LogIn, CheckCircle2, Loader2 } from 'lucide-react';
import { FormattedAuthError } from '../utils/authErrors';
import { AuthAlert } from './AuthAlert';

export interface OTPVerificationProps {
  email: string;
  password?: string;
  onVerify?: (code: string) => Promise<boolean>;
  onResend: () => Promise<void>;
  onEditDetails: () => void;
  onGoToSignIn?: () => void;
  onCheckVerification?: (opts?: { silent?: boolean }) => Promise<{ isVerified: boolean; error?: FormattedAuthError }>;
  isSubmitting?: boolean;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  onResend,
  onEditDetails,
  onGoToSignIn,
  onCheckVerification,
  isSubmitting = false,
}) => {
  const [error, setError] = useState<FormattedAuthError | string | null>(null);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [resendSuccess, setResendSuccess] = useState<boolean>(false);

  // Guard refs to prevent multiple redirects or orphan intervals
  const isRedirectingRef = useRef<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Automatic verification polling every 5 seconds
  useEffect(() => {
    let isMounted = true;

    const performAutoCheck = async () => {
      if (!onCheckVerification || isRedirectingRef.current) return;
      try {
        const res = await onCheckVerification({ silent: true });
        if (res?.isVerified && isMounted && !isRedirectingRef.current) {
          isRedirectingRef.current = true;

          // Immediately stop polling after verification
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }

          console.log('[Auth] Automatic verification detected! Redirecting user...');
        }
      } catch (err: any) {
        console.log('[Auth] Automatic check error:', err?.message || err);
      }
    };

    // Immediate check on mount
    performAutoCheck();

    // Poll every 5 seconds
    intervalRef.current = setInterval(() => {
      if (isMounted && !isRedirectingRef.current) {
        performAutoCheck();
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, 5000);

    // Cleanup interval on component unmount
    return () => {
      isMounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [onCheckVerification]);

  // Helper to open user's webmail provider
  const handleOpenEmail = () => {
    let emailDomain = 'mail.google.com';
    if (email.includes('@outlook.com') || email.includes('@hotmail.com') || email.includes('@live.com')) {
      emailDomain = 'outlook.live.com';
    } else if (email.includes('@yahoo.com')) {
      emailDomain = 'mail.yahoo.com';
    } else if (email.includes('@icloud.com')) {
      emailDomain = 'www.icloud.com/mail';
    }
    window.open(`https://${emailDomain}`, '_blank', 'noopener,noreferrer');
  };

  const handleResendClick = async () => {
    if (isResending) return;
    setIsResending(true);
    setError(null);
    setResendSuccess(false);

    try {
      await onResend();
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err: any) {
      setError({
        title: 'Resend Failed',
        message: 'Could not send verification email at this time. Please try again in a few moments.'
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleAlreadyVerifiedClick = async () => {
    if (isChecking || isRedirectingRef.current) return;
    setIsChecking(true);
    setError(null);

    try {
      if (onCheckVerification) {
        const res = await onCheckVerification({ silent: false });
        if (res?.isVerified) {
          isRedirectingRef.current = true;
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        } else {
          setError(
            res?.error || {
              title: "Your email hasn't been verified yet.",
              message: "Please check your inbox and click the verification link to activate your PantryPal account."
            }
          );
        }
      } else if (onGoToSignIn) {
        onGoToSignIn();
      }
    } catch (err: any) {
      setError({
        title: 'Verification Check Error',
        message: err?.message || 'Failed to check verification status. Please try again.'
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Graphic Header */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black flex items-center justify-center mx-auto font-bold shadow-xl shadow-[#D4AF37]/15">
          <Mail className="w-7 h-7 text-black stroke-[2.2]" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#F5F2EB] leading-tight">
            Verification email sent successfully
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-[#D4AF37] break-all max-w-sm mx-auto">
            {email}
          </p>
        </div>
        <p className="text-xs text-[#C2BCB2] max-w-xs mx-auto leading-relaxed">
          Please check your email inbox and click the verification link to activate your PantryPal account.
        </p>

        {/* Live polling status indicator */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-[#A39C90] pt-1">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse shrink-0" />
          <span>Auto-checking verification status every 5s...</span>
        </div>
      </div>

      {/* Optional Error Alert */}
      {error && (
        <AuthAlert
          error={error}
          onDismiss={() => setError(null)}
          onRetry={handleAlreadyVerifiedClick}
        />
      )}

      {/* Resend Confirmation Toast */}
      {resendSuccess && (
        <div className="p-3.5 bg-emerald-950/50 border border-emerald-500/50 rounded-2xl text-xs text-emerald-300 flex items-center gap-2.5 animate-in fade-in duration-200 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">Verification email resent successfully! Please check your inbox.</span>
        </div>
      )}

      {/* Primary Actions Grid: Open Email, Resend Email, Change Email */}
      <div className="space-y-3 pt-2">
        {/* 1. Open Email Button */}
        <button
          type="button"
          onClick={handleOpenEmail}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] hover:brightness-110 text-black font-extrabold text-xs rounded-2xl transition-all cursor-pointer shadow-lg shadow-[#D4AF37]/15 flex items-center justify-center gap-2 group"
        >
          <span>Open Email</span>
          <ExternalLink className="w-4 h-4 text-black transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 duration-150" />
        </button>

        <div className="grid grid-cols-2 gap-2.5">
          {/* 2. Resend Email Button */}
          <button
            type="button"
            onClick={handleResendClick}
            disabled={isResending || isSubmitting || isChecking}
            className="w-full py-3 px-3 bg-[#23211E] hover:bg-[#2A2724] border border-[#D4AF37]/40 hover:border-[#D4AF37] text-[#F5F2EB] font-bold text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isResending ? (
              <Loader2 className="w-3.5 h-3.5 text-[#D4AF37] animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-[#D4AF37]" />
            )}
            <span>Resend Email</span>
          </button>

          {/* 3. Change Email Button */}
          <button
            type="button"
            onClick={onEditDetails}
            disabled={isSubmitting || isChecking}
            className="w-full py-3 px-3 bg-[#23211E] hover:bg-[#2A2724] border border-[#2A2724] hover:border-[#D4AF37]/50 text-[#C2BCB2] hover:text-[#F5F2EB] font-bold text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#A39C90]" />
            <span>Change Email</span>
          </button>
        </div>

        {/* 4. Already verified? Sign In Link / Button */}
        <div className="pt-3 text-center border-t border-[#2A2724]">
          <button
            type="button"
            onClick={handleAlreadyVerifiedClick}
            disabled={isChecking}
            className="text-xs text-[#D4AF37] hover:underline font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isChecking ? (
              <Loader2 className="w-3.5 h-3.5 text-[#D4AF37] animate-spin" />
            ) : (
              <LogIn className="w-3.5 h-3.5" />
            )}
            <span>Already verified? Sign In</span>
          </button>
        </div>
      </div>
    </div>
  );
};
