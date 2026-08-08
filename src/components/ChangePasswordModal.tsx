import React, { useState, useEffect } from 'react';
import { KeyRound, X, Eye, EyeOff, Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { PasswordStrengthChecker, evaluatePasswordRules } from './PasswordStrengthChecker';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { changePassword } = useAuth();
  const { showToast } = useApp();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [touched, setTouched] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Reset modal state when opened/closed
  useEffect(() => {
    if (isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setTouched({ current: false, new: false, confirm: false });
      setIsSubmitting(false);
      setServerError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Validation logic
  const currentError = touched.current && !currentPassword ? 'Current password is required.' : null;
  const newPasswordError =
    touched.new && newPassword.length > 0 && newPassword.length < 8
      ? 'New password must be at least 8 characters long.'
      : null;
  const confirmError =
    touched.confirm && confirmPassword.length > 0 && confirmPassword !== newPassword
      ? 'Confirm password must match new password.'
      : null;

  const rules = evaluatePasswordRules(newPassword);
  const isFormValid =
    currentPassword.trim().length > 0 &&
    newPassword.length >= 8 &&
    confirmPassword === newPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Mark all touched
    setTouched({ current: true, new: true, confirm: true });

    if (!currentPassword) {
      setServerError('Current password is required.');
      return;
    }

    if (newPassword.length < 8) {
      setServerError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setServerError('Confirm password must match new password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await changePassword(currentPassword, newPassword);

      if (res.success) {
        showToast('✓ Password updated successfully', 'success');
        onClose();
      } else {
        setServerError(res.error || 'Failed to update password. Please check your credentials.');
      }
    } catch (err: any) {
      console.error('[ChangePasswordModal] Submit error:', err);
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#1A1918] rounded-[28px] border border-[#2A2724] p-6 sm:p-7 shadow-2xl space-y-5 relative"
        role="dialog"
        aria-labelledby="change-password-title"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-2 text-[#A39C90] hover:text-[#F5F2EB] rounded-xl hover:bg-[#23211E] transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 pr-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 via-[#E5C158]/10 to-transparent border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0 shadow-md">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 id="change-password-title" className="font-serif font-bold text-xl text-[#F5F2EB]">
              Change Password
            </h2>
            <p className="text-xs text-[#A39C90] mt-0.5 leading-snug">
              Update your security credentials. Re-authentication is required for your protection.
            </p>
          </div>
        </div>

        {/* Server / General Error Alert */}
        {serverError && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-2.5 text-red-400 text-xs animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium">{serverError}</span>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1" noValidate>
          {/* Current Password Field */}
          <div className="space-y-1.5">
            <label htmlFor="current-password" className="block text-xs font-bold text-[#F5F2EB]">
              Current Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A39C90]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="current-password"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (serverError) setServerError(null);
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, current: true }))}
                placeholder="Enter current password"
                disabled={isSubmitting}
                autoFocus
                className={`w-full pl-10 pr-11 py-3 bg-[#1E1D1B] border rounded-2xl text-sm text-[#F5F2EB] placeholder-[#8A8275] font-medium shadow-md transition-all focus:outline-none ${
                  currentError
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                    : 'border-[#2A2724] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                tabIndex={-1}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A39C90] hover:text-[#F5F2EB] p-1 transition-colors"
                aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {currentError && <p className="text-[11px] text-red-400 font-medium pl-1">{currentError}</p>}
          </div>

          {/* New Password Field */}
          <div className="space-y-1.5">
            <label htmlFor="new-password" className="block text-xs font-bold text-[#F5F2EB]">
              New Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A39C90]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="new-password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (serverError) setServerError(null);
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, new: true }))}
                placeholder="Minimum 8 characters"
                disabled={isSubmitting}
                className={`w-full pl-10 pr-11 py-3 bg-[#1E1D1B] border rounded-2xl text-sm text-[#F5F2EB] placeholder-[#8A8275] font-medium shadow-md transition-all focus:outline-none ${
                  newPasswordError
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                    : 'border-[#2A2724] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                tabIndex={-1}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A39C90] hover:text-[#F5F2EB] p-1 transition-colors"
                aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {newPasswordError && <p className="text-[11px] text-red-400 font-medium pl-1">{newPasswordError}</p>}

            {/* Password strength details */}
            {newPassword.length > 0 && <PasswordStrengthChecker password={newPassword} />}
          </div>

          {/* Confirm New Password Field */}
          <div className="space-y-1.5">
            <label htmlFor="confirm-password" className="block text-xs font-bold text-[#F5F2EB]">
              Confirm New Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A39C90]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (serverError) setServerError(null);
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, confirm: true }))}
                placeholder="Re-enter new password"
                disabled={isSubmitting}
                className={`w-full pl-10 pr-11 py-3 bg-[#1E1D1B] border rounded-2xl text-sm text-[#F5F2EB] placeholder-[#8A8275] font-medium shadow-md transition-all focus:outline-none ${
                  confirmError
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                    : 'border-[#2A2724] focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A39C90] hover:text-[#F5F2EB] p-1 transition-colors"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmError && <p className="text-[11px] text-red-400 font-medium pl-1">{confirmError}</p>}
            {confirmPassword.length > 0 && confirmPassword === newPassword && (
              <p className="text-[11px] text-emerald-400 font-medium pl-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2A2724]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="py-3 px-5 bg-[#23211E] hover:bg-[#2A2724] text-[#C2BCB2] font-bold text-xs rounded-2xl transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="py-3 px-6 bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black font-extrabold text-xs rounded-2xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#D4AF37]/15 transition-all cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
