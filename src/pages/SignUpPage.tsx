import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { ChefHat, Mail, Lock, ArrowRight, User, Eye, EyeOff, Loader2, Check, AlertCircle } from 'lucide-react';
import { PhoneInput, COUNTRY_CODES, CountryCode } from '../components/PhoneInput';
import { PasswordStrengthChecker, isPasswordFullyValid } from '../components/PasswordStrengthChecker';
import { validatePhoneWithLib } from '../utils/phoneValidation';
import { OTPVerification } from '../components/OTPVerification';
import { AuthAlert } from '../components/AuthAlert';
import { FormattedAuthError, formatAuthError } from '../utils/authErrors';
import { navigateToPostAuth } from '../utils/navigation';

export const SignUpPage: React.FC = () => {
  const { user, signUp, resendVerificationEmail, signInWithGoogle, checkEmailVerification, openAuthModal } = useAuth();
  const { navigateTo, showToast } = useApp();

  // Redirect automatically whenever user is authenticated/verified
  useEffect(() => {
    if (user) {
      showToast('Welcome to PantryPal!', 'success');
      navigateToPostAuth(navigateTo);
    }
  }, [user, navigateTo, showToast]);

  // Wizard Step: 1 = Registration Details, 2 = Verification Email Sent Screen
  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_CODES[0]);
  const [phone, setPhone] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Error & Submission States
  const [error, setError] = useState<FormattedAuthError | string | null>(null);
  const [submittingMethod, setSubmittingMethod] = useState<'email' | 'google' | null>(null);
  const isSubmitting = submittingMethod !== null;
  const [touchedEmail, setTouchedEmail] = useState(false);

  // Always ensure clean initial state with no stale/global error banner on mount or mode switch
  useEffect(() => {
    setError(null);
  }, []);

  // Validation Checks
  const isValidEmailFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(email.trim());
  const emailHasError = touchedEmail && email.trim().length > 0 && !isValidEmailFormat;

  // Phone Validation using libphonenumber-js
  const phoneValidation = validatePhoneWithLib(phone, selectedCountry);
  const phoneError = phone ? phoneValidation.error || null : null;

  // Password Strength Check (all 5 rules must pass)
  const isPasswordValid = isPasswordFullyValid(password);

  // Comprehensive Form Validity
  const isFormValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    isValidEmailFormat &&
    isPasswordValid &&
    agreedToTerms &&
    !phoneError;

  // 1. Google Authentication
  const handleGoogleSignUp = async () => {
    if (isSubmitting) return;
    setError(null);
    setSubmittingMethod('google');
    try {
      const res = await signInWithGoogle();
      if (res.success) {
        showToast('Welcome to PantryPal!', 'success');
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

  // 2. Form Submit Handler -> Triggers Real Firebase Create Account & Email Verification
  const handleCreateAccount = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;
    setError(null);
    setTouchedEmail(true);

    const emailTrimmed = email.trim();

    if (!firstName.trim()) {
      setError({ title: 'First Name Required', message: 'Please enter your first name.' });
      return;
    }
    if (!lastName.trim()) {
      setError({ title: 'Last Name Required', message: 'Please enter your last name.' });
      return;
    }
    if (!emailTrimmed || !isValidEmailFormat) {
      setError({ title: 'Invalid Email', message: 'Please enter a valid email address (e.g. chef@example.com).' });
      return;
    }
    if (!isPasswordValid) {
      setError({
        title: 'Password Rules Not Met',
        message: 'Please ensure your password meets all strength criteria listed below.'
      });
      return;
    }
    if (!agreedToTerms) {
      setError({
        title: 'Terms Required',
        message: "Please agree to PantryPal's Terms of Service and Privacy Policy to create an account."
      });
      return;
    }
    if (phone && phoneError) {
      setError({ title: 'Invalid Contact Number', message: phoneError });
      return;
    }

    setSubmittingMethod('email');
    const fullPhone = phone ? `${selectedCountry.dialCode}${phone.trim()}` : undefined;

    try {
      const res = await signUp({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: emailTrimmed,
        password,
        phone: fullPhone,
      });

      if (res.success) {
        showToast(`Verification email sent to ${emailTrimmed}!`, 'success');
        setStep(2);
        if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        if (res.errorFormatted) {
          setError(res.errorFormatted);
        } else {
          setError(formatAuthError(res.error || 'Failed to complete registration. Please try again.'));
        }
      }
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setSubmittingMethod(null);
    }
  };

  const handleResendEmail = async () => {
    const res = await resendVerificationEmail(email.trim(), password);
    if (res.success) {
      showToast(`Verification email resent to ${email.trim()}`, 'success');
    } else if (res.errorFormatted) {
      setError(res.errorFormatted);
    } else {
      showToast('Could not resend email right now.', 'error');
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-12 selection:bg-[#D4AF37]/30">
      <div className="max-w-md w-full bg-[#1A1918] rounded-[28px] border border-[#2A2724] p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 relative overflow-hidden">
        
        {/* Background ambient glow accent */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        {step === 2 ? (
          /* STEP 2: Email Verification Sent Screen */
          <OTPVerification
            email={email}
            password={password}
            onResend={handleResendEmail}
            onEditDetails={() => {
              setError(null);
              setStep(1);
            }}
            onGoToSignIn={() => {
              navigateTo('/auth/signin');
            }}
            onCheckVerification={async (opts) => {
              const res = await checkEmailVerification(email, password, opts);
              if (res.isVerified) {
                showToast('Email verified successfully! Welcome to PantryPal!', 'success');
                navigateToPostAuth(navigateTo);
              }
              return res;
            }}
            isSubmitting={isSubmitting}
          />
        ) : (
          /* STEP 1: Registration Form */
          <>
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black flex items-center justify-center mx-auto font-bold shadow-lg shadow-[#D4AF37]/10">
                <ChefHat className="w-7 h-7 text-black" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5F2EB] tracking-tight">
                Create an account
              </h1>
              <p className="text-xs sm:text-sm text-[#C2BCB2] max-w-xs mx-auto leading-relaxed">
                Start matching recipes with ingredients sitting in your fridge.
              </p>
            </div>

            {/* Server / Form Error Alert */}
            {error && (
              <AuthAlert
                error={error}
                onDismiss={() => setError(null)}
                onRetry={() => handleCreateAccount()}
              />
            )}

            {/* 1. Continue with Google Button */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
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
                OR CREATE WITH EMAIL
              </span>
              <div className="border-t border-[#2A2724] w-full" />
            </div>

            {/* Sign Up Form */}
            <form onSubmit={handleCreateAccount} className="space-y-4">
              
              {/* First Name & Last Name Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#F5F2EB] flex items-center gap-0.5">
                    First Name <span className="text-[#D4AF37] font-extrabold">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-[#A39C90] absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="Alex"
                      className="w-full pl-10 pr-3 py-3 bg-[#23211E] border border-[#2A2724] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 rounded-2xl text-xs text-[#F5F2EB] placeholder-[#8A8275] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#F5F2EB] flex items-center gap-0.5">
                    Last Name <span className="text-[#D4AF37] font-extrabold">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-[#A39C90] absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="Rivera"
                      className="w-full pl-10 pr-3 py-3 bg-[#23211E] border border-[#2A2724] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 rounded-2xl text-xs text-[#F5F2EB] placeholder-[#8A8275] focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#F5F2EB] flex items-center gap-0.5">
                  Email Address <span className="text-[#D4AF37] font-extrabold">*</span>
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

              {/* Password Field with Live Password Strength Indicator */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#F5F2EB] flex items-center gap-0.5">
                  Password <span className="text-[#D4AF37] font-extrabold">*</span>
                </label>
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
                    placeholder="Create a strong password"
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

                {/* Password Strength Checklist */}
                <PasswordStrengthChecker password={password} />
              </div>

              {/* Contact Number (Optional, with libphonenumber-js validation) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#F5F2EB]">
                    Contact Number
                  </label>
                  <span className="text-[10px] text-[#A39C90] font-medium">(Optional)</span>
                </div>

                <PhoneInput
                  value={phone}
                  onChange={(val) => {
                    setPhone(val);
                    if (error) setError(null);
                  }}
                  selectedCountry={selectedCountry}
                  onCountryChange={(c) => {
                    setSelectedCountry(c);
                    if (error) setError(null);
                  }}
                  placeholder="10-digit number"
                  hasError={!!phoneError}
                />

                {phoneError && (
                  <p className="text-[11px] font-bold text-[#E6A135] flex items-start gap-1 pl-1 animate-in fade-in duration-150 pt-0.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{phoneError}</span>
                  </p>
                )}
              </div>

              {/* Terms & Conditions Section */}
              <div className="pt-2 pb-1">
                <label className="flex items-start gap-3 cursor-pointer group text-xs text-[#C2BCB2] select-none">
                  <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => {
                        setAgreedToTerms(e.target.checked);
                        if (error) setError(null);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-4 h-4 rounded-md border border-[#2A2724] bg-[#23211E] peer-checked:bg-[#D4AF37] peer-checked:border-[#D4AF37] peer-focus:ring-2 peer-focus:ring-[#D4AF37]/30 transition-all flex items-center justify-center group-hover:border-[#D4AF37]/60">
                      {agreedToTerms && <Check className="w-3 h-3 text-black stroke-[3]" />}
                    </div>
                  </div>
                  <span className="leading-relaxed text-[11px] sm:text-xs">
                    I agree to PantryPal's{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigateTo('/legal/terms');
                      }}
                      className="text-[#D4AF37] font-bold hover:underline cursor-pointer"
                    >
                      Terms of Service
                    </button>
                    ,{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigateTo('/legal/privacy');
                      }}
                      className="text-[#D4AF37] font-bold hover:underline cursor-pointer"
                    >
                      Privacy Policy
                    </button>
                    {' '}and{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigateTo('/legal/cookies');
                      }}
                      className="text-[#D4AF37] font-bold hover:underline cursor-pointer"
                    >
                      Cookie Policy
                    </button>
                    .
                  </span>
                </label>
              </div>

              {/* Create Account Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:shadow-none text-black font-extrabold text-xs rounded-2xl transition-all cursor-pointer shadow-lg shadow-[#D4AF37]/15 flex items-center justify-center gap-2 mt-2"
              >
                {submittingMethod === 'email' ? (
                  <>
                    <Loader2 className="w-4 h-4 text-black animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight className="w-4 h-4 text-black" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Link */}
            <div className="text-center pt-4 border-t border-[#2A2724] text-xs text-[#A39C90]">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => openAuthModal('sign-in')}
                className="font-bold text-[#D4AF37] hover:underline cursor-pointer ml-1"
              >
                Sign In
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
