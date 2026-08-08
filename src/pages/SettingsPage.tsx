import React, { useState, useEffect } from 'react';
import { useAuth, formatTitleCase } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { User, Mail, AlertTriangle, Trash2, Check, Edit2, ShieldAlert, X, ShieldCheck, KeyRound, CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react';
import * as db from '../services/db';
import { auth } from '../lib/firebase';
import { ChangePasswordModal } from '../components/ChangePasswordModal';

export const SettingsPage: React.FC = () => {
  const { user, isAuthenticated, updateProfile, deleteAccount, openAuthModal } = useAuth();
  const { navigateTo, showToast } = useApp();

  // Redirect to home and open auth modal if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigateTo('/');
      openAuthModal('Please sign in to access settings.');
    }
  }, [isAuthenticated, navigateTo]);

  // Initial form values from logged in user
  const initialName = user?.name ? formatTitleCase(user.name) : '';
  const initialEmail = user?.email || '';

  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state if user prop updates
  useEffect(() => {
    if (user) {
      setName(user.name ? formatTitleCase(user.name) : '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Validation
  const isNameEmpty = !name.trim();
  const isValidEmail = email.trim().length > 0 && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/i.test(email.trim());
  const isEmailInvalid = email.trim().length > 0 && !isValidEmail;

  // Check if modified from initial user record
  const isModified = (name.trim() !== initialName.trim()) || (email.trim() !== initialEmail.trim());

  // Modal Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Reauthentication Modal state
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [reauthPassword, setReauthPassword] = useState('');
  const [showReauthPasswordText, setShowReauthPasswordText] = useState(false);
  const [isReauthenticating, setIsReauthenticating] = useState(false);

  // Change Password Modal state
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Check real Firebase email verification status & provider
  const isGoogleUser = Boolean(
    auth.currentUser?.providerData.some(p => p.providerId === 'google.com')
  );

  const isEmailVerified = Boolean(
    !auth.currentUser ||
    auth.currentUser.emailVerified ||
    isGoogleUser
  );

  if (!user || !isAuthenticated) {
    return null;
  }

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isNameEmpty) {
      showToast('Name cannot be empty', 'error');
      return;
    }

    if (!isValidEmail) {
      const msg = email.trim().toLowerCase().endsWith('.co')
        ? 'Invalid email address. Email must end with .com (did you mean .com instead of .co?)'
        : 'Please enter a valid email address ending in .com';
      showToast(msg, 'error');
      return;
    }

    setIsSaving(true);
    try {
      const cleanName = formatTitleCase(name.trim());
      const cleanEmail = email.trim();

      updateProfile({ name: cleanName, email: cleanEmail });
      await db.updateUserProfile(user.id, { name: cleanName, email: cleanEmail });

      setIsEditingName(false);
      setIsEditingEmail(false);
      showToast('Profile updated successfully', 'success');
    } catch (error) {
      console.error('Save profile error:', error);
      showToast('Failed to update profile. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') return;

    setIsDeleting(true);
    try {
      const res = await deleteAccount();
      if (res.success) {
        setShowDeleteModal(false);
        navigateTo('/');
        showToast('Your PantryPal account has been permanently deleted.', 'info');
      } else if (res.requiresRecentLogin) {
        setShowDeleteModal(false);
        setReauthPassword('');
        setShowReauthModal(true);
        showToast('For security reasons, please sign in again before deleting your account.', 'info');
      } else {
        showToast(res.error || 'Failed to delete account. Please try again.', 'error');
      }
    } catch (error: any) {
      console.error('Delete account error:', error);
      showToast(error?.message || 'Failed to delete account. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReauthAndDelete = async (passwordOverride?: string) => {
    const pwd = passwordOverride !== undefined ? passwordOverride : reauthPassword;
    if (!isGoogleUser && !pwd.trim()) {
      showToast('Please enter your password to confirm deletion', 'error');
      return;
    }

    setIsReauthenticating(true);
    try {
      const res = await deleteAccount(pwd);
      if (res.success) {
        setShowReauthModal(false);
        navigateTo('/');
        showToast('Your PantryPal account has been permanently deleted.', 'info');
      } else {
        showToast(res.error || 'Reauthentication failed. Please check your password and try again.', 'error');
      }
    } catch (error: any) {
      console.error('Reauth and delete error:', error);
      showToast(error?.message || 'Reauthentication failed. Please try again.', 'error');
    } finally {
      setIsReauthenticating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-200 selection:bg-[#D4AF37]/30">
      
      {/* Header */}
      <div className="space-y-1 border-b border-[#2A2724] pb-6">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5F2EB]">
          Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#C2BCB2]">
          Manage your account credentials, primary contact email, and security controls.
        </p>
      </div>

      {/* Section 1: Account Information */}
      <div className="bg-[#1A1918] rounded-3xl border border-[#2A2724] p-6 shadow-xl space-y-6">
        <div>
          <h2 className="text-lg font-serif font-bold text-[#F5F2EB] flex items-center gap-2">
            <User className="w-5 h-5 text-[#D4AF37]" />
            Account Information
          </h2>
          <p className="text-xs text-[#A39C90] mt-1">
            Update your account display name and primary contact email address.
          </p>
        </div>

        <form onSubmit={handleSaveChanges} className="space-y-5">
          {/* Full Name Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#C2BCB2] block">Full Name</label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                readOnly={!isEditingName}
                onClick={() => !isEditingName && setIsEditingName(true)}
                className={`w-full pl-10 pr-28 py-3 bg-[#1E1D1B] border rounded-2xl text-sm font-semibold transition-all ${
                  isNameEmpty && isEditingName
                    ? 'border-red-500 focus:ring-red-500/20'
                    : isEditingName
                    ? 'border-[#D4AF37] bg-[#23211E] text-[#F5F2EB]'
                    : 'border-[#2A2724] text-[#C2BCB2] cursor-pointer'
                } focus:outline-none`}
                placeholder="Enter your name"
              />
              <User className="w-4 h-4 text-[#A39C90] absolute left-3.5" />
              
              <button
                type="button"
                onClick={() => setIsEditingName(!isEditingName)}
                className="absolute right-3 px-3 py-1 bg-[#23211E] hover:bg-[#2A2724] border border-[#2A2724] text-[#D4AF37] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>{isEditingName ? 'Done' : 'Edit Name'}</span>
              </button>
            </div>
            {isNameEmpty && isEditingName && (
              <p className="text-xs text-red-400 font-medium pl-1">Name cannot be empty</p>
            )}
          </div>

          {/* Email Address Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#C2BCB2] block">Email Address</label>
            <div className="relative flex items-center">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly={!isEditingEmail}
                onClick={() => !isEditingEmail && setIsEditingEmail(true)}
                className={`w-full pl-10 pr-32 py-3 bg-[#1E1D1B] border rounded-2xl text-sm font-semibold transition-all ${
                  isEmailInvalid && isEditingEmail
                    ? 'border-red-500 focus:ring-red-500/20'
                    : isEditingEmail
                    ? 'border-[#D4AF37] bg-[#23211E] text-[#F5F2EB]'
                    : 'border-[#2A2724] text-[#C2BCB2] cursor-pointer'
                } focus:outline-none`}
                placeholder="Enter your email address"
              />
              <Mail className="w-4 h-4 text-[#A39C90] absolute left-3.5" />
              
              <button
                type="button"
                onClick={() => setIsEditingEmail(!isEditingEmail)}
                className="absolute right-3 px-3 py-1 bg-[#23211E] hover:bg-[#2A2724] border border-[#2A2724] text-[#D4AF37] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>{isEditingEmail ? 'Done' : 'Change Email'}</span>
              </button>
            </div>
            {isEmailInvalid && isEditingEmail && (
              <p className="text-xs text-red-400 font-medium pl-1">Please enter a valid email address</p>
            )}
          </div>

          {/* Save Changes Button (Only appears when modified) */}
          {isModified && (
            <div className="pt-2 animate-in fade-in duration-150">
              <button
                type="submit"
                disabled={isSaving || isNameEmpty || !isValidEmail}
                className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C5A028] text-black font-extrabold text-xs rounded-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md flex items-center gap-2"
              >
                <Check className="w-4 h-4 text-black stroke-[3]" />
                <span>{isSaving ? 'Saving Changes...' : 'Save Changes'}</span>
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Section 2: Security & Account Controls */}
      <div className="bg-[#1A1918] rounded-3xl border border-[#2A2724] p-6 shadow-xl space-y-4">
        <div>
          <h2 className="text-base font-serif font-bold text-[#F5F2EB] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
            Security &amp; Account Controls
          </h2>
          <p className="text-xs text-[#A39C90] mt-1">
            Manage authentication security and email verification status.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Change Password */}
          <div
            onClick={() => setIsChangePasswordOpen(true)}
            className="bg-[#1E1D1B] border border-[#2A2724] hover:border-[#D4AF37]/50 rounded-2xl p-4 flex items-center justify-between gap-3 cursor-pointer transition-all group shadow-md hover:shadow-lg hover:shadow-[#D4AF37]/5"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#23211E] border border-[#2A2724] group-hover:border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0 transition-colors">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#F5F2EB] group-hover:text-[#D4AF37] transition-colors">Change Password</p>
                <p className="text-[11px] text-[#A39C90]">Secure password management</p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsChangePasswordOpen(true);
              }}
              className="px-3.5 py-1.5 bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black hover:brightness-110 text-[11px] font-extrabold rounded-xl transition-all cursor-pointer shadow-md shadow-[#D4AF37]/15 shrink-0"
            >
              Change
            </button>
          </div>

          {/* Email Verification */}
          <div className="bg-[#1E1D1B] border border-[#2A2724] rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#23211E] border border-[#2A2724] flex items-center justify-center shrink-0">
                {isEmailVerified ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-[#E6A135]" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-[#F5F2EB]">Email Verification</p>
                <p className="text-[11px] text-[#A39C90] leading-snug">
                  {isEmailVerified
                    ? 'Your email address has been successfully verified.'
                    : 'Please verify your email address to unlock all account features.'}
                </p>
              </div>
            </div>
            <span
              className={`px-2.5 py-0.5 border text-[10px] font-bold rounded-full flex items-center gap-1 shrink-0 ${
                isEmailVerified
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-[#E6A135]/10 border-[#E6A135]/30 text-[#E6A135]'
              }`}
            >
              <span>{isEmailVerified ? '🟢 Verified' : '🟡 Verification Required'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Section 3: Delete Account (DANGER ZONE) */}
      <div className="bg-[#1A1918] rounded-3xl border border-red-500/30 p-6 shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex items-center gap-2 text-red-400 font-serif font-bold text-lg">
          <ShieldAlert className="w-5 h-5 text-red-500" />
          <span>DANGER ZONE</span>
        </div>

        <p className="text-xs text-[#C2BCB2]">
          Permanently delete your PantryPal account and all associated data. This action cannot be undone.
        </p>

        <div className="pt-2">
          <button
            onClick={() => {
              setConfirmText('');
              setShowDeleteModal(true);
            }}
            className="px-5 py-2.5 bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4 text-white" />
            <span>Delete My Account</span>
          </button>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#1A1918] rounded-[28px] border border-red-500/40 p-6 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 p-1.5 text-[#A39C90] hover:text-[#F5F2EB] rounded-lg hover:bg-[#23211E] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#F5F2EB]">Are you sure?</h3>
            </div>

            <div className="text-xs text-[#C2BCB2] space-y-2 leading-relaxed">
              <p>This will permanently delete your account and all your data, including:</p>
              <ul className="list-disc pl-5 space-y-1 text-[#F5F2EB] font-medium">
                <li>Your saved pantry items</li>
                <li>Your favorite recipes</li>
                <li>Your profile information</li>
              </ul>
              <p className="text-red-400 font-bold pt-1">This cannot be undone.</p>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#2A2724]">
              <label className="text-xs font-bold text-[#F5F2EB] block">
                Type <span className="text-red-400 font-mono tracking-wider font-extrabold">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder='Type "DELETE"'
                className="w-full px-3.5 py-2.5 bg-[#1E1D1B] border border-[#2A2724] focus:border-red-500 rounded-xl text-sm font-mono text-[#F5F2EB] placeholder-[#8A8275] focus:outline-none"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-[#23211E] hover:bg-[#2A2724] text-[#C2BCB2] font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmText !== 'DELETE' || isDeleting}
                onClick={handleDeleteAccount}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-950/40 disabled:text-red-300/40 disabled:border-transparent text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Everything'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Re-authentication Required Modal */}
      {showReauthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#1A1918] rounded-[28px] border border-amber-500/40 p-6 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setShowReauthModal(false)}
              className="absolute top-4 right-4 p-1.5 text-[#A39C90] hover:text-[#F5F2EB] rounded-lg hover:bg-[#23211E] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 text-[#E6A135]">
              <div className="w-10 h-10 rounded-2xl bg-[#E6A135]/10 border border-[#E6A135]/30 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 text-[#E6A135]" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[#F5F2EB]">Security Verification Required</h3>
                <p className="text-[11px] text-[#A39C90]">Confirm identity before deletion</p>
              </div>
            </div>

            <p className="text-xs text-[#C2BCB2] leading-relaxed">
              For security reasons, please sign in again before deleting your account.
            </p>

            {isGoogleUser ? (
              <div className="space-y-4 pt-2 border-t border-[#2A2724]">
                <p className="text-xs text-[#A39C90]">
                  You signed in with Google. Click below to verify your Google identity and permanently delete your account.
                </p>
                <button
                  type="button"
                  disabled={isReauthenticating}
                  onClick={() => handleReauthAndDelete('GOOGLE_PROVIDER')}
                  className="w-full py-3 bg-[#23211E] hover:bg-[#2A2724] border border-[#D4AF37]/50 hover:border-[#D4AF37] text-[#D4AF37] font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span>{isReauthenticating ? 'Verifying with Google...' : 'Reauthenticate with Google & Delete Account'}</span>
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleReauthAndDelete();
                }}
                className="space-y-4 pt-2 border-t border-[#2A2724]"
              >
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#F5F2EB] block">
                    Current Password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showReauthPasswordText ? 'text' : 'password'}
                      value={reauthPassword}
                      onChange={(e) => setReauthPassword(e.target.value)}
                      placeholder="Enter your current password"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#1E1D1B] border border-[#2A2724] focus:border-red-500 rounded-xl text-sm text-[#F5F2EB] placeholder-[#8A8275] focus:outline-none"
                      autoFocus
                    />
                    <Lock className="w-4 h-4 text-[#A39C90] absolute left-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowReauthPasswordText(!showReauthPasswordText)}
                      className="absolute right-3 text-[#A39C90] hover:text-[#F5F2EB]"
                    >
                      {showReauthPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReauthModal(false)}
                    className="px-4 py-2 bg-[#23211E] hover:bg-[#2A2724] text-[#C2BCB2] font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!reauthPassword.trim() || isReauthenticating}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isReauthenticating ? 'Deleting Account...' : 'Confirm & Delete Account'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

    </div>
  );
};
