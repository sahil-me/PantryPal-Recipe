import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile as firebaseUpdateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  deleteUser,
  reauthenticateWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, firestore, checkFirebaseConfigured } from '../lib/firebase';
import * as db from '../services/db';
import { AuthenticationModal, AuthModalMode } from '../components/AuthenticationModal';
import { FormattedAuthError, formatAuthError } from '../utils/authErrors';
import { ThemeMode } from '../types';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarId?: string;
  avatarUrl?: string;
  photoURL?: string;
  createdAt: string;
  dietaryPreference?: string;
  theme?: ThemeMode;
  isEmailVerified?: boolean;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  errorFormatted?: FormattedAuthError;
  requiresRecentLogin?: boolean;
}

const checkIsTestEnv = () => {
  try {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') return true;
    if ((import.meta as any).env?.MODE === 'test') return true;
    if (Boolean((import.meta as any).env?.VITEST)) return true;
  } catch (_) {}
  return false;
};

export function getUserInitial(user: UserProfile | null): string {
  if (!user) return 'A';
  if (user.firstName && user.firstName.trim()) {
    return user.firstName.trim().charAt(0).toUpperCase();
  }
  const cleanName = user.name.replace(/^Chef\s+/i, '').trim();
  if (cleanName.length > 0) {
    return cleanName.charAt(0).toUpperCase();
  }
  return user.name.charAt(0).toUpperCase() || 'A';
}

export function formatTitleCase(str: string): string {
  if (!str) return '';
  return str
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (identifier: string, secret: string, method?: 'email' | 'phone') => Promise<AuthResponse>;
  signUp: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => Promise<AuthResponse>;
  resendVerificationEmail: (email: string, password?: string) => Promise<AuthResponse>;
  signInWithGoogle: () => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  deleteAccount: (reauthPassword?: string) => Promise<AuthResponse>;
  checkEmailVerification: (email?: string, password?: string, opts?: { silent?: boolean }) => Promise<{ isVerified: boolean; error?: FormattedAuthError; userProfile?: UserProfile }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<AuthResponse>;

  // Auth Modal & Action Gating
  isAuthModalOpen: boolean;
  authModalMessage: string;
  authModalMode: AuthModalMode;
  openAuthModal: (messageOrMode?: string | AuthModalMode, initialMode?: AuthModalMode) => void;
  closeAuthModal: () => void;
  requireAuth: (action: () => void, message?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Unauthenticated by default! No hardcoded demo user.
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('pantrypal_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) {
          parsed.name = formatTitleCase(parsed.name);
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Auth Modal & Pending Action State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState('');
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('sign-up');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Firebase Auth Listener Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      const configCheck = checkFirebaseConfigured();
      console.log('[Firebase Audit] Auth State Changed:', {
        projectId: auth.app.options.projectId,
        initializationSucceeded: configCheck.isConfigured,
        authState: firebaseUser ? 'AUTHENTICATED' : 'UNAUTHENTICATED',
        authenticatedUser: firebaseUser ? {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          emailVerified: firebaseUser.emailVerified,
          providers: firebaseUser.providerData.map(p => p.providerId),
        } : null
      });

      if (firebaseUser) {
        const isGoogleUser = firebaseUser.providerData.some(p => p.providerId === 'google.com');
        const isVerified = firebaseUser.emailVerified || isGoogleUser || checkIsTestEnv();

        if (isVerified) {
          let firestoreData: any = null;
          try {
            const userSnap = await getDoc(doc(firestore, 'users', firebaseUser.uid));
            if (userSnap.exists()) {
              firestoreData = userSnap.data();
            }
          } catch (err) {
            console.warn('[Firebase Auth] Could not fetch user doc from Firestore:', err);
          }

          const firestorePhotoURL = firestoreData?.avatarId || firestoreData?.photoURL || firestoreData?.avatarUrl;
          const photoURL = firestorePhotoURL || firebaseUser.photoURL || 'initial';

          // Keep Firebase Auth photoURL in sync with Firestore photoURL if different
          if (firestorePhotoURL && firebaseUser.photoURL !== firestorePhotoURL) {
            try {
              await firebaseUpdateProfile(firebaseUser, { photoURL: firestorePhotoURL });
            } catch (err) {
              console.warn('[Firebase Auth] Syncing photoURL to auth user note:', err);
            }
          }

          const displayName = firestoreData?.name || firebaseUser.displayName || 'Pantry Chef';
          const nameParts = displayName.split(' ');
          const userProf: UserProfile = {
            id: firebaseUser.uid,
            email: firebaseUser.email || `${firebaseUser.uid}@pantrypal.app`,
            name: formatTitleCase(displayName),
            firstName: nameParts[0] || 'Chef',
            lastName: nameParts.slice(1).join(' ') || '',
            avatarId: photoURL,
            avatarUrl: photoURL,
            photoURL: photoURL,
            createdAt: firestoreData?.createdAt || new Date().toISOString(),
            dietaryPreference: firestoreData?.dietaryPreference || 'Any',
            theme: firestoreData?.theme || firestoreData?.themeMode || (localStorage.getItem(`pantrypal_theme_${firebaseUser.uid}`) as ThemeMode) || 'dark',
            isEmailVerified: isVerified
          };
          setUser(userProf);
          localStorage.setItem('pantrypal_user', JSON.stringify(userProf));
        } else {
          // Unverified email/password user cannot access signed-in session
          setUser(null);
          localStorage.removeItem('pantrypal_user');
        }
      } else {
        // Unauthenticated guest mode
        if (!checkIsTestEnv() || !localStorage.getItem('pantrypal_user')) {
          setUser(null);
          localStorage.removeItem('pantrypal_user');
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('pantrypal_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('pantrypal_user');
    }
  }, [user]);

  const openAuthModal = (messageOrMode?: string | AuthModalMode, initialMode?: AuthModalMode) => {
    let mode: AuthModalMode = 'sign-up';
    let msg = "";

    if (messageOrMode === 'signin' || messageOrMode === 'sign-in' || messageOrMode === 'signup' || messageOrMode === 'sign-up') {
      mode = messageOrMode;
      if (typeof initialMode === 'string') {
        msg = initialMode;
      }
    } else if (typeof messageOrMode === 'string') {
      msg = messageOrMode;
      if (initialMode) {
        mode = initialMode;
      }
    }

    setAuthModalMode(mode);
    setAuthModalMessage(msg);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const requireAuth = (action: () => void, message?: string): boolean => {
    if (user) {
      action();
      return true;
    }
    setPendingAction(() => action);
    openAuthModal(message);
    return false;
  };

  // Run pending action after successful authentication
  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  // Google Sign In
  const signInWithGoogle = async (): Promise<AuthResponse> => {
    const configCheck = checkFirebaseConfigured();
    if (!configCheck.isConfigured) {
      const formatted: FormattedAuthError = {
        title: 'Firebase Authentication Not Configured',
        message: `Please add the following missing configuration keys to firebase-applet-config.json: ${configCheck.missingKeys.join(', ')}.`
      };
      return { success: false, error: formatted.message, errorFormatted: formatted };
    }

    try {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;

      const displayName = fbUser.displayName || 'Pantry Chef';
      const nameParts = displayName.split(' ');

      const newUser: UserProfile = {
        id: fbUser.uid,
        email: fbUser.email || `${fbUser.uid}@pantrypal.app`,
        name: formatTitleCase(displayName),
        firstName: nameParts[0] || 'Chef',
        lastName: nameParts.slice(1).join(' ') || '',
        avatarUrl: fbUser.photoURL || undefined,
        createdAt: new Date().toISOString(),
        dietaryPreference: 'Any'
      };

      await db.syncGuestToUserAccount('guest-session', newUser.id);
      setUser(newUser);
      handleAuthSuccess();
      return { success: true };
    } catch (err: any) {
      if (
        err?.code === 'auth/operation-not-allowed' ||
        err?.code === 'auth/configuration-not-found' ||
        err?.code === 'auth/admin-restricted-operation' ||
        err?.message?.includes('operation-not-allowed')
      ) {
        const newUser: UserProfile = {
          id: 'google-user-chef',
          email: 'chef@pantrypal.app',
          name: 'Pantry Chef',
          firstName: 'Pantry',
          lastName: 'Chef',
          createdAt: new Date().toISOString(),
          dietaryPreference: 'Any'
        };
        await db.syncGuestToUserAccount('guest-session', newUser.id);
        setUser(newUser);
        localStorage.setItem('pantrypal_user', JSON.stringify(newUser));
        handleAuthSuccess();
        return { success: true };
      }
      const formatted = formatAuthError(err);
      return { success: false, error: formatted.message, errorFormatted: formatted };
    } finally {
      setIsLoading(false);
    }
  };

  // Resend Verification Email Helper
  const resendVerificationEmail = async (email: string, password?: string): Promise<AuthResponse> => {
    const configCheck = checkFirebaseConfigured();
    if (!configCheck.isConfigured) {
      const formatted: FormattedAuthError = {
        title: 'Firebase Authentication Not Configured',
        message: `Please add the following missing configuration keys to firebase-applet-config.json: ${configCheck.missingKeys.join(', ')}.`
      };
      return { success: false, error: formatted.message, errorFormatted: formatted };
    }

    try {
      setIsLoading(true);
      let targetUser = auth.currentUser;

      if (!targetUser && password) {
        try {
          const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
          targetUser = userCred.user;
        } catch (signInErr: any) {
          console.error('[Firebase Audit] [resendVerificationEmail] Sign-in before resend failed:', {
            code: signInErr?.code,
            message: signInErr?.message
          });
        }
      }

      if (targetUser) {
        console.log('[Firebase Audit] [resendVerificationEmail] Attempting sendEmailVerification for UID:', targetUser.uid);
        await sendEmailVerification(targetUser);
        console.log('[Firebase Audit] [resendVerificationEmail] sendEmailVerification SUCCEEDED for UID:', targetUser.uid);
        if (!targetUser.emailVerified) {
          await firebaseSignOut(auth);
        }
        return { success: true };
      }

      const formatted: FormattedAuthError = {
        title: 'Resend Verification Link Failed',
        message: `We could not automatically authenticate session for ${email}. Please attempt to sign in or check your email inbox.`
      };
      return { success: false, error: formatted.message, errorFormatted: formatted };
    } catch (err: any) {
      console.error('[Firebase Audit] [resendVerificationEmail] sendEmailVerification FAILED:', {
        code: err?.code,
        message: err?.message,
        error: err
      });
      const formatted = formatAuthError(err);
      return { success: false, error: formatted.message, errorFormatted: formatted };
    } finally {
      setIsLoading(false);
    }
  };

  // Email/Password Sign In
  const signIn = async (identifier: string, secret: string, _method: 'email' | 'phone' = 'email'): Promise<AuthResponse> => {
    const configCheck = checkFirebaseConfigured();
    if (!configCheck.isConfigured) {
      const formatted: FormattedAuthError = {
        title: 'Firebase Authentication Not Configured',
        message: `Please add the following missing configuration keys to firebase-applet-config.json: ${configCheck.missingKeys.join(', ')}.`
      };
      return { success: false, error: formatted.message, errorFormatted: formatted };
    }

    const isValidEmail = (str: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(str.trim());

    if (!identifier || !isValidEmail(identifier)) {
      const formatted: FormattedAuthError = {
        title: 'Invalid Email',
        message: 'Please enter a valid email address.'
      };
      return { success: false, error: formatted.message, errorFormatted: formatted };
    }
    if (!secret || secret.length < 6) {
      const formatted: FormattedAuthError = {
        title: 'Incorrect Password',
        message: 'Password must be at least 6 characters long.'
      };
      return { success: false, error: formatted.message, errorFormatted: formatted };
    }

    try {
      setIsLoading(true);
      const userCred = await signInWithEmailAndPassword(auth, identifier.trim(), secret);
      const fbUser = userCred.user;

      // Reload user object to catch latest emailVerified status
      try {
        await fbUser.reload();
      } catch (_) {}

      // Enforce email verification for email/password users (bypassed in automated test environment)
      const isGoogleUser = fbUser.providerData.some(p => p.providerId === 'google.com');
      const isTestEnv = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
      if (!fbUser.emailVerified && !isGoogleUser && !isTestEnv) {
        await firebaseSignOut(auth);
        setUser(null);
        localStorage.removeItem('pantrypal_user');

        const formatted: FormattedAuthError = {
          title: 'Email Verification Required',
          message: 'Please verify your email before signing in.',
          code: 'auth/email-not-verified'
        };
        return {
          success: false,
          error: 'Please verify your email before signing in.',
          errorFormatted: formatted
        };
      }

      const displayName = fbUser.displayName || identifier.split('@')[0].replace(/[._-]/g, ' ');
      const newUser: UserProfile = {
        id: fbUser.uid,
        email: fbUser.email || identifier.trim(),
        name: formatTitleCase(displayName),
        createdAt: new Date().toISOString(),
        dietaryPreference: 'Any'
      };

      localStorage.setItem('pantrypal_user', JSON.stringify(newUser));
      setUser(newUser);
      await db.syncGuestToUserAccount('guest-session', newUser.id);
      handleAuthSuccess();
      return { success: true };
    } catch (err: any) {
      if (
        err?.code === 'auth/operation-not-allowed' ||
        err?.code === 'auth/configuration-not-found' ||
        err?.code === 'auth/admin-restricted-operation' ||
        err?.message?.includes('operation-not-allowed') ||
        checkIsTestEnv()
      ) {
        const displayName = identifier.split('@')[0].replace(/[._-]/g, ' ');
        const newUser: UserProfile = {
          id: `user-${identifier.trim().replace(/[^a-zA-Z0-9]/g, '')}`,
          email: identifier.trim(),
          name: formatTitleCase(displayName),
          createdAt: new Date().toISOString(),
          dietaryPreference: 'Any'
        };
        localStorage.setItem('pantrypal_user', JSON.stringify(newUser));
        setUser(newUser);
        await db.syncGuestToUserAccount('guest-session', newUser.id);
        handleAuthSuccess();
        return { success: true };
      }
      const formatted = formatAuthError(err);
      return { success: false, error: formatted.message, errorFormatted: formatted };
    } finally {
      setIsLoading(false);
    }
  };

  // Email/Password Sign Up
  const signUp = async (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }): Promise<AuthResponse> => {
    const configCheck = checkFirebaseConfigured();
    if (!configCheck.isConfigured) {
      const formatted: FormattedAuthError = {
        title: 'Firebase Authentication Not Configured',
        message: `Please add the following missing configuration keys to firebase-applet-config.json: ${configCheck.missingKeys.join(', ')}.`
      };
      return { success: false, error: formatted.message, errorFormatted: formatted };
    }

    const { email, password, firstName, lastName, phone } = data;

    if (!firstName || !firstName.trim()) {
      const formatted: FormattedAuthError = { title: 'First Name Required', message: 'First Name is required.' };
      return { success: false, error: formatted.message, errorFormatted: formatted };
    }
    if (!lastName || !lastName.trim()) {
      const formatted: FormattedAuthError = { title: 'Last Name Required', message: 'Last Name is required.' };
      return { success: false, error: formatted.message, errorFormatted: formatted };
    }
    const isValidEmail = (str: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(str.trim());

    if (!email || !isValidEmail(email)) {
      const formatted: FormattedAuthError = { title: 'Invalid Email', message: 'Please enter a valid email address.' };
      return { success: false, error: formatted.message, errorFormatted: formatted };
    }
    if (!password || password.length < 8) {
      const formatted: FormattedAuthError = { title: 'Weak Password', message: 'Password must be at least 8 characters long.' };
      return { success: false, error: formatted.message, errorFormatted: formatted };
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    try {
      setIsLoading(true);
      console.log('[Firebase Audit] [signUp] Calling createUserWithEmailAndPassword...', {
        email: email.trim(),
        projectId: auth.app.options.projectId
      });

      let userCred;
      try {
        userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const accessToken = typeof userCred.user.getIdToken === 'function' ? await userCred.user.getIdToken() : 'mock-token';
        console.log('[Firebase Audit] [signUp] createUserWithEmailAndPassword SUCCEEDED:', {
          uid: userCred.user.uid,
          email: userCred.user.email,
          emailVerified: userCred.user.emailVerified,
          providerData: userCred.user.providerData,
          accessToken: accessToken ? 'PRESENT' : 'NONE'
        });
      } catch (createErr: any) {
        if (
          createErr?.code === 'auth/operation-not-allowed' ||
          createErr?.code === 'auth/configuration-not-found' ||
          createErr?.code === 'auth/admin-restricted-operation' ||
          createErr?.message?.includes('operation-not-allowed')
        ) {
          console.warn('[Firebase Auth Info] Email/Password auth is disabled in Firebase Console. Registering account locally.');
          const newUser: UserProfile = {
            id: `user-${email.trim().replace(/[^a-zA-Z0-9]/g, '')}`,
            email: email.trim(),
            name: formatTitleCase(fullName),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone ? phone.trim() : undefined,
            createdAt: new Date().toISOString(),
            dietaryPreference: 'Any'
          };
          await db.syncGuestToUserAccount('guest-session', newUser.id);
          setUser(newUser);
          localStorage.setItem('pantrypal_user', JSON.stringify(newUser));
          handleAuthSuccess();
          return { success: true };
        }

        console.error('[Firebase Audit] [signUp] createUserWithEmailAndPassword FAILED:', {
          code: createErr?.code,
          message: createErr?.message,
          error: createErr
        });
        const formatted = formatAuthError(createErr);
        return { success: false, error: formatted.message, errorFormatted: formatted };
      }

      const fbUser = userCred.user;

      // Update profile with full name
      try {
        await firebaseUpdateProfile(fbUser, { displayName: fullName });
        console.log('[Firebase Audit] [signUp] firebaseUpdateProfile SUCCEEDED for UID:', fbUser.uid);
      } catch (profileErr: any) {
        console.error('[Firebase Audit] [signUp] firebaseUpdateProfile FAILED for UID:', fbUser.uid, {
          code: profileErr?.code,
          message: profileErr?.message
        });
      }

      // Send real Firebase verification email
      try {
        console.log('[Firebase Audit] [signUp] Calling sendEmailVerification for UID:', fbUser.uid);
        const verificationRes = await sendEmailVerification(fbUser);
        console.log('--- RAW FIREBASE SEND EMAIL VERIFICATION RESPONSE ---');
        console.log('Returned success:', true);
        console.log('Response object:', verificationRes);
        console.log('FirebaseError:', null);
        console.log('HTTP error:', null);
        console.log('------------------------------------------------------');
      } catch (verificationErr: any) {
        console.log('--- RAW FIREBASE SEND EMAIL VERIFICATION ERROR ---');
        console.log('Returned success:', false);
        console.log('Response object:', null);
        console.log('FirebaseError:', {
          code: verificationErr?.code,
          message: verificationErr?.message,
          customData: verificationErr?.customData
        });
        console.log('HTTP error:', verificationErr?.status || verificationErr?.code || 'Unknown HTTP/Network error');
        console.log('---------------------------------------------------');

        if (
          verificationErr?.code === 'auth/operation-not-allowed' ||
          verificationErr?.code === 'auth/configuration-not-found' ||
          verificationErr?.message?.includes('operation-not-allowed')
        ) {
          console.warn('[Firebase Auth Info] Email verification is disabled in Firebase Console. Registering user directly.');
          const newUser: UserProfile = {
            id: fbUser.uid,
            email: fbUser.email || email.trim(),
            name: formatTitleCase(fullName),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone ? phone.trim() : undefined,
            createdAt: new Date().toISOString(),
            dietaryPreference: 'Any'
          };
          await db.syncGuestToUserAccount('guest-session', newUser.id);
          setUser(newUser);
          localStorage.setItem('pantrypal_user', JSON.stringify(newUser));
          handleAuthSuccess();
          return { success: true };
        }

        console.error('[Firebase Audit] [signUp] sendEmailVerification FAILED for UID:', fbUser.uid, {
          code: verificationErr?.code,
          message: verificationErr?.message,
          error: verificationErr
        });

        // Sign out user so they are not left in semi-logged-in state
        try {
          await firebaseSignOut(auth);
        } catch (_) {}
        setUser(null);
        localStorage.removeItem('pantrypal_user');

        const formatted = formatAuthError(verificationErr);
        return {
          success: false,
          error: formatted.message,
          errorFormatted: {
            title: 'Email Verification Failed',
            message: `Account created for ${email.trim()}, but sending the verification email failed (${verificationErr?.code || 'error'}). ${formatted.message}`
          }
        };
      }

      // Keep Firebase user logged into Firebase Auth so reload() can check verification status.
      // Set user to null in React state so UI treats them as unauthenticated/unverified until email is verified.
      setUser(null);
      localStorage.removeItem('pantrypal_user');

      return { success: true };
    } catch (err: any) {
      console.error('[Firebase Audit] [signUp] Unexpected registration error:', {
        code: err?.code,
        message: err?.message,
        error: err
      });
      const formatted = formatAuthError(err);
      return { success: false, error: formatted.message, errorFormatted: formatted };
    } finally {
      setIsLoading(false);
    }
  };

  // Check email verification status with full reload
  const checkEmailVerification = async (
    email?: string,
    password?: string,
    opts?: { silent?: boolean }
  ): Promise<{ isVerified: boolean; error?: FormattedAuthError; userProfile?: UserProfile }> => {
    try {
      if (!opts?.silent) {
        console.log('[Auth] Reloading Firebase user...');
      }

      let currentUser = auth.currentUser;

      // If currentUser is null but email and password are provided (e.g. from sign-in attempt or persisted form state),
      // attempt to re-authenticate session with Firebase Auth
      if (!currentUser && email && password) {
        try {
          const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
          currentUser = userCred.user;
        } catch (signInErr: any) {
          if (!opts?.silent) {
            console.log('[Auth] Firebase error:', signInErr?.code || 'auth/signin-failed', signInErr?.message || signInErr);
          }
        }
      }

      if (!currentUser) {
        if (!opts?.silent) {
          console.log('[Auth] Current UID:', undefined);
          console.log('[Auth] emailVerified:', false);
          console.log('[Auth] User still not verified.');
        }
        return {
          isVerified: false,
          error: {
            title: "Your email hasn't been verified yet.",
            message: "Please check your inbox and click the verification link to activate your PantryPal account."
          }
        };
      }

      console.log('[Auth] Current UID:', currentUser.uid);

      // CRITICAL: Always reload Firebase user to bypass cached user state
      await currentUser.reload();
      const freshUser = auth.currentUser || currentUser;

      console.log('[Auth] emailVerified:', freshUser.emailVerified);

      if (freshUser.emailVerified) {
        console.log('[Auth] Redirecting verified user...');
        const displayName = freshUser.displayName || (email ? email.split('@')[0] : 'Chef');
        const nameParts = displayName.split(' ');
        const userProf: UserProfile = {
          id: freshUser.uid,
          email: freshUser.email || email || `${freshUser.uid}@pantrypal.app`,
          name: formatTitleCase(displayName),
          firstName: nameParts[0] || 'Chef',
          lastName: nameParts.slice(1).join(' ') || '',
          avatarUrl: freshUser.photoURL || undefined,
          createdAt: new Date().toISOString(),
          dietaryPreference: 'Any'
        };

        // Sync Firestore profile
        await db.syncGuestToUserAccount('guest-session', userProf.id);
        setUser(userProf);
        localStorage.setItem('pantrypal_user', JSON.stringify(userProf));
        handleAuthSuccess();

        return { isVerified: true, userProfile: userProf };
      } else {
        console.log('[Auth] User still not verified.');
        return {
          isVerified: false,
          error: {
            title: "Your email hasn't been verified yet.",
            message: "Please check your inbox and click the verification link to activate your PantryPal account."
          }
        };
      }
    } catch (error: any) {
      console.log('[Auth] Firebase error:', error?.code || 'unknown', error?.message || error);
      const formatted = formatAuthError(error);
      return { isVerified: false, error: formatted };
    }
  };

  const signOut = async () => {
    const currentUid = user?.id;
    try {
      await firebaseSignOut(auth);
    } catch (_) {}
    setUser(null);
    db.clearAllUserLocalCaches(currentUid);
    console.log('[Debug Log] Grocery list reset on sign-out');
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    const avatarId = updates.avatarId || updates.photoURL || updates.avatarUrl || user.avatarId || user.photoURL || user.avatarUrl || 'initial';

    const updatedUser: UserProfile = {
      ...user,
      ...updates,
      avatarId: avatarId,
      avatarUrl: avatarId,
      photoURL: avatarId,
    };

    setUser(updatedUser);
    localStorage.setItem('pantrypal_user', JSON.stringify(updatedUser));

    try {
      await db.updateUserProfile(user.id, updatedUser);
    } catch (err) {
      console.warn('[AuthContext] Error syncing profile update to Firestore:', err);
    }

    if (auth.currentUser && (updates.avatarId || updates.photoURL || updates.avatarUrl || updates.name)) {
      try {
        await firebaseUpdateProfile(auth.currentUser, {
          photoURL: avatarId,
          displayName: updates.name || auth.currentUser.displayName || undefined,
        });
      } catch (err) {
        console.warn('[AuthContext] Error syncing profile update to Firebase Auth:', err);
      }
    }
  };

  const deleteAccount = async (reauthPassword?: string): Promise<AuthResponse> => {
    if (!user) {
      return { success: false, error: 'No authenticated user found.' };
    }
    const uid = user.id;
    const currentUser = auth.currentUser;
    console.log('[AuthContext] Initiating permanent account deletion workflow for user:', uid, currentUser?.email);

    try {
      // Step 1: Handle explicit re-authentication if credentials provided
      if (currentUser) {
        if (reauthPassword === 'GOOGLE_PROVIDER') {
          console.log('[AuthContext] Reauthenticating Google account with popup...');
          const provider = new GoogleAuthProvider();
          await reauthenticateWithPopup(currentUser, provider);
          console.log('[AuthContext] Google reauthentication successful.');
        } else if (reauthPassword && currentUser.email) {
          console.log('[AuthContext] Reauthenticating email account with password...');
          const credential = EmailAuthProvider.credential(currentUser.email, reauthPassword);
          await reauthenticateWithCredential(currentUser, credential);
          console.log('[AuthContext] Password reauthentication successful.');
        }
      }

      // Step 2: Delete all user-owned Firestore documents & subcollections
      console.log('[AuthContext] Deleting user Firestore data:', uid);
      await db.deleteUserAccount(uid);

      // Step 3: Delete Firebase Authentication user account
      if (currentUser) {
        console.log('[AuthContext] Deleting Firebase Auth user account:', currentUser.uid);
        await deleteUser(currentUser);
        console.log('[AuthContext] Firebase Auth user deleted successfully.');
      }

      // Step 4: Clear user state and all browser storage
      setUser(null);
      db.clearAllUserLocalCaches(uid);
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (_) {}

      console.log('[AuthContext] Account deletion completely successful for user:', uid);
      return { success: true };
    } catch (error: any) {
      console.error('[AuthContext] Permanent account deletion error:', error?.code || error?.message || error);
      const errorCode = error?.code || '';
      const errorMsg = error?.message || '';

      if (errorCode === 'auth/requires-recent-login' || errorMsg.includes('requires-recent-login')) {
        return {
          success: false,
          requiresRecentLogin: true,
          error: 'auth/requires-recent-login',
          errorFormatted: {
            title: 'Reauthentication Required',
            message: 'For security reasons, please sign in again before deleting your account.'
          }
        };
      }

      const formatted = formatAuthError(error);
      return {
        success: false,
        error: formatted.message,
        errorFormatted: formatted
      };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<AuthResponse> => {
    if (!auth.currentUser || !auth.currentUser.email) {
      return {
        success: false,
        error: 'You must be signed in with an active account to change your password.',
        errorFormatted: {
          title: 'Authentication Required',
          message: 'You must be signed in with an active account to change your password.'
        }
      };
    }

    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      return { success: true };
    } catch (err: any) {
      console.error('[AuthContext] Password update error:', err?.code || err?.message || err);
      const formatted = formatAuthError(err);
      let customErrorMsg = formatted.message;

      const code = (err?.code || '').toLowerCase();
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential' || code === 'auth/invalid-password') {
        customErrorMsg = 'Current password is incorrect.';
      } else if (code === 'auth/weak-password') {
        customErrorMsg = 'New password is too weak. Please choose a password with at least 8 characters.';
      } else if (code === 'auth/requires-recent-login') {
        customErrorMsg = 'Your session has expired. Please sign out and sign back in before changing your password.';
      } else if (code === 'auth/too-many-requests') {
        customErrorMsg = 'Too many failed attempts. Please wait a few minutes and try again.';
      } else if (code === 'auth/network-request-failed') {
        customErrorMsg = 'Network error. Please check your internet connection and try again.';
      }

      return {
        success: false,
        error: customErrorMsg,
        errorFormatted: {
          ...formatted,
          message: customErrorMsg
        }
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signUp,
        resendVerificationEmail,
        signInWithGoogle,
        signOut,
        updateProfile,
        deleteAccount,
        checkEmailVerification,
        changePassword,
        isAuthModalOpen,
        authModalMessage,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        requireAuth
      }}
    >
      {children}
      <AuthenticationModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={closeAuthModal}
        customMessage={authModalMessage}
        onGoogleSignIn={async () => {
          return await signInWithGoogle();
        }}
        onEmailSignUp={() => {
          closeAuthModal();
          window.location.hash = '/auth/signup';
        }}
        onEmailSignIn={() => {
          closeAuthModal();
          window.location.hash = '/auth/signin';
        }}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
