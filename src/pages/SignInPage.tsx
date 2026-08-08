import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { ChefHat, Mail, Lock, ArrowRight, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { AuthAlert } from '../components/AuthAlert';
import { FormattedAuthError, formatAuthError } from '../utils/authErrors';
import { navigateToPostAuth } from '../utils/navigation';

export const SignInPage: React.FC = () => {
  const { user, signIn, resendVerificationEmail, signInWithGoogle, openAuthModal } = useAuth();
  const { navigateTo, showToast } = useApp();

  // Auto-redirect when user is authenticated/verified
  useEffect(() => {
    if (user) {
      showToast('Welcome back to PantryPal!', 'success');
      navigateToPostAuth(navigateTo);
    }
  }, [user, navigateTo, showToast]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<FormattedAuthError | string | null>(null);
  const [submittingMethod, setSubmittingMethod] = useState<'email' | 'google' | null>(null);
  const isSubmitting = submittingMethod !== null;
  const [touchedEmail, setTouchedEmail] = useState(false);

  // Clear any previous error banner immediately when component mounts or page opens
  useEffect(() => {
    setError(null);
  }, []);

  const handleResendEmail = async () => {
    if (!email.trim()) {
      showToast('Please enter your email address to resend verification link.', 'error');
      return;
    }
    const res = await resendVerificationEmail(email.trim(), password);
    if (res.success) {
      showToast(`Verification email resent to ${email.trim()}! Please check your inbox.`, 'success');
    } else if (res.errorFormatted) {
      setError(res.errorFormatted);
    } else {
      showToast('Failed to resend verification email.', 'error');
    }
  };

  const isValidEmailFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(email.trim());
  const emailHasError = touchedEmail && email.trim().length > 0 && !isValidEmailFormat;

  const isFormValid = email.trim().length > 0 && isValidEmailFormat && password.length > 0;

  const handleGoogleSignIn = async () => {
    if (isSubmitting) return;
    setError(null);
    setSubmittingMethod('google');
    try {
      const res = await signInWithGoogle();
      if (res.success) {
        showToast('Welcome back to PantryPal!', 'success');
        navigateToPostAuth(navigateTo);
      } else if (res.errorFormatted?.isCancelled) {
        // User closed popup window, do not display error banner
      } else if (res.errorFormatted) {
        setError(res.errorFormatted);
      } else if (res.error) {
        const formatted = formatAuthError(res.error);
        if (!formatted.isCancelled) {
          setError(formatted);
        }
      }
    } catch (err) {
      const formatted = formatAuthError(err);
      if (!formatted.isCancelled) {
        setError(formatted);
      }
    } finally {
      setSubmittingMethod(null);
    }
  };

  const handleEmailSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;
    setError(null);
    setTouchedEmail(true);

    const emailTrimmed = email.trim();

    if (!emailTrimmed) {
      setError({
        title: 'Email Required',
        message: 'Please enter your email address to sign in.'
      });
      return;
    }

    if (!isValidEmailFormat) {
      setError({
        title: 'Invalid Email Format',
        message: 'Please enter a valid email address (e.g. chef@example.com).'
      });
      return;
    }

    if (!password) {
      setError({
        title: 'Password Required',
        message: 'Please enter your password to continue.'
      });
      return;
    }

    setSubmittingMethod('email');
    try {
      const res = await signIn(emailTrimmed, password, 'email');

      if (res.success) {
        showToast('Successfully signed in to PantryPal!', 'success');
        navigateToPostAuth(navigateTo);
      } else if (res.errorFormatted) {
        setError(res.errorFormatted);
      } else {
        setError(formatAuthError(res.error || 'The email or password you entered is incorrect.'));
      }
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setSubmittingMethod(null);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-12 selection:bg-[#D4AF37]/30">
      <div className="max-w-md w-full bg-[#1A1918] rounded-[28px] border border-[#2A2724] p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 relative overflow-hidden">
        
        {/* Subtle background glow accent */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black flex items-center justify-center mx-auto font-bold shadow-lg shadow-[#D4AF37]/10">
            <ChefHat className="w-7 h-7 text-black" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5F2EB] tracking-tight">
            Welcome back
          </h1>
          <p className="text-xs sm:text-sm text-[#C2BCB2] max-w-xs mx-auto leading-relaxed">
            Sign in to access your saved pantry and favorite recipes.
          </p>
        </div>

        {/* Server / Form Error Display */}
        {error && (
          <AuthAlert
            error={error}
            onDismiss={() => setError(null)}
            onRetry={() => handleEmailSubmit()}
            onResendEmail={handleResendEmail}
          />
        )}

        {/* 1. Continue with Google Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 bg-[#23211E] hover:bg-[#2A2724] border border-[#D4AF37]/40 hover:border-[#D4AF37] text-[#F5F2EB] font-bold text-xs rounded-2xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {submittingMethod === 'google' ? (
            <>
              <Loader2 className="w-4 h-4 text-[#D4AF37] animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110 duration-200" viewBox="0 0 24 24">
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

        {/* 2. Divider */}
        <div className="relative flex items-center justify-center my-5">
          <div className="border-t border-[#2A2724] w-full" />
          <span className="bg-[#1A1918] px-3.5 text-[10px] uppercase tracking-widest text-[#A39C90] font-bold shrink-0">
            OR SIGN IN WITH EMAIL
          </span>
          <div className="border-t border-[#2A2724] w-full" />
        </div>

        {/* 3. Email & Password Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#F5F2EB] flex items-center justify-between">
              <span className="flex items-center gap-1">
                Email Address <span className="text-[#D4AF37] font-extrabold">*</span>
              </span>
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-[#A39C90] absolute left-3.5 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onBlur={() => setTouchedEmail(true)}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="chef@example.com"
                className={`w-full pl-10 pr-4 py-3 bg-[#23211E] border ${
                  emailHasError
                    ? 'border-red-500/80 focus:border-red-500 ring-2 ring-red-500/20'
                    : 'border-[#2A2724] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20'
                } rounded-2xl text-xs text-[#F5F2EB] placeholder-[#8A8275] focus:outline-none transition-all`}
              />
            </div>
            {emailHasError && (
              <p className="text-[11px] font-semibold text-red-400 flex items-center gap-1 pl-1 pt-0.5 animate-in fade-in duration-150">
                <AlertCircle className="w-3 h-3 text-red-400 shrink-0" />
                <span>Please enter a valid email address</span>
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#F5F2EB] flex items-center gap-1">
                Password <span className="text-[#D4AF37] font-extrabold">*</span>
              </label>
            </div>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-[#A39C90] absolute left-3.5 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-[#23211E] border border-[#2A2724] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 rounded-2xl text-xs text-[#F5F2EB] placeholder-[#8A8275] focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 p-1.5 text-[#A39C90] hover:text-[#D4AF37] transition-colors cursor-pointer rounded-lg hover:bg-[#2A2724]"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-[#D4AF37]" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:shadow-none text-black font-extrabold text-xs rounded-2xl transition-all cursor-pointer shadow-lg shadow-[#D4AF37]/15 flex items-center justify-center gap-2 mt-2"
          >
            {submittingMethod === 'email' ? (
              <>
                <Loader2 className="w-4 h-4 text-black animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In with Email</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </>
            )}
          </button>
        </form>

        {/* 4. Below Button Footer */}
        <div className="text-center pt-4 border-t border-[#2A2724] text-xs text-[#A39C90]">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => openAuthModal('sign-up')}
            className="font-bold text-[#D4AF37] hover:underline cursor-pointer ml-1"
          >
            Create one for free
          </button>
        </div>

      </div>
    </div>
  );
};
