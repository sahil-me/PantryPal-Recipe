export interface FormattedAuthError {
  title: string;
  message: string;
  code?: string;
  isCancelled?: boolean;
}

/**
 * Parses and maps Firebase & authentication errors into clean, production-ready, user-friendly messages.
 * NEVER exposes raw Firebase error codes (e.g. auth/popup-closed-by-user), exception names,
 * stack traces, or internal error strings to the end user.
 *
 * Logs the full error in the developer console for observability and debugging.
 */
export function formatAuthError(err: any): FormattedAuthError {
  const errorCode = (err?.code || '').toLowerCase();
  const rawMessage = (typeof err?.message === 'string' ? err.message : '').toLowerCase();
  const errString = (typeof err === 'string' ? err : '').toLowerCase();

  const isCancelled =
    errorCode === 'auth/popup-closed-by-user' ||
    errorCode === 'auth/cancelled-popup-request' ||
    rawMessage.includes('popup-closed-by-user') ||
    rawMessage.includes('cancelled-popup-request') ||
    errString.includes('popup-closed-by-user') ||
    errString.includes('cancelled-popup-request');

  const isUserCredentialError =
    errorCode === 'auth/invalid-credential' ||
    errorCode === 'auth/wrong-password' ||
    errorCode === 'auth/user-not-found' ||
    errorCode === 'auth/email-already-in-use' ||
    errorCode === 'auth/invalid-email' ||
    errorCode === 'auth/weak-password' ||
    errorCode === 'auth/popup-blocked' ||
    errorCode === 'auth/too-many-requests' ||
    errorCode === 'auth/user-disabled' ||
    errorCode === 'auth/email-not-verified' ||
    rawMessage.includes('invalid-credential') ||
    rawMessage.includes('wrong-password') ||
    rawMessage.includes('user-not-found') ||
    rawMessage.includes('email-already-in-use') ||
    rawMessage.includes('invalid-email');

  if (isCancelled) {
    console.info('[PantryPal Auth Info]: User closed or cancelled sign-in popup.');
  } else if (isUserCredentialError) {
    console.info('[PantryPal Auth Info]: Auth attempt result:', errorCode || rawMessage || 'User authentication failure');
  } else {
    // Log non-cancellation unexpected errors with warning
    console.warn('[PantryPal Auth Warning]:', err);
  }

  // 1. Popup Closed by User / Cancelled
  if (isCancelled) {
    return {
      title: 'Sign-in Cancelled',
      message: 'You closed the Google sign-in window before completing authentication. Please try again.',
      code: errorCode || 'auth/popup-closed-by-user',
      isCancelled: true
    };
  }

  // 2. Cancelled Popup Request
  if (
    errorCode === 'auth/cancelled-popup-request' ||
    rawMessage.includes('cancelled-popup-request') ||
    errString.includes('cancelled-popup-request')
  ) {
    return {
      title: 'Sign-in Cancelled',
      message: 'The Google sign-in process was cancelled. Please try again.',
      code: 'auth/cancelled-popup-request',
      isCancelled: true
    };
  }

  // 3. Popup Blocked
  if (
    errorCode === 'auth/popup-blocked' ||
    rawMessage.includes('popup-blocked') ||
    errString.includes('popup-blocked')
  ) {
    return {
      title: 'Popup Blocked',
      message: 'Your browser blocked the sign-in window. Please allow popups for PantryPal and try again.',
      code: 'auth/popup-blocked'
    };
  }

  // 4. Network Request Failed / Connection Problem
  if (
    errorCode === 'auth/network-request-failed' ||
    rawMessage.includes('network-request-failed') ||
    errString.includes('network-request-failed')
  ) {
    return {
      title: 'Connection Problem',
      message: "We couldn't connect to the server. Please check your internet connection and try again.",
      code: 'auth/network-request-failed'
    };
  }

  // 5. Invalid Credential
  if (
    errorCode === 'auth/invalid-credential' ||
    rawMessage.includes('invalid-credential') ||
    errString.includes('invalid-credential')
  ) {
    return {
      title: 'Sign-in Failed',
      message: 'The email or password you entered is incorrect.',
      code: 'auth/invalid-credential'
    };
  }

  // 6. Email Already in Use
  if (
    errorCode === 'auth/email-already-in-use' ||
    rawMessage.includes('email-already-in-use') ||
    errString.includes('email-already-in-use')
  ) {
    return {
      title: 'Account Already Exists',
      message: 'An account with this email already exists. Please sign in instead.',
      code: 'auth/email-already-in-use'
    };
  }

  // 7. User Not Found
  if (
    errorCode === 'auth/user-not-found' ||
    rawMessage.includes('user-not-found') ||
    errString.includes('user-not-found')
  ) {
    return {
      title: 'Account Not Found',
      message: 'No account was found with this email.',
      code: 'auth/user-not-found'
    };
  }

  // 8. Wrong Password
  if (
    errorCode === 'auth/wrong-password' ||
    rawMessage.includes('wrong-password') ||
    errString.includes('wrong-password')
  ) {
    return {
      title: 'Incorrect Password',
      message: 'Please check your password and try again.',
      code: 'auth/wrong-password'
    };
  }

  // 9. Too Many Requests
  if (
    errorCode === 'auth/too-many-requests' ||
    rawMessage.includes('too-many-requests') ||
    errString.includes('too-many-requests')
  ) {
    return {
      title: 'Too Many Attempts',
      message: 'Too many unsuccessful attempts. Please wait a few minutes before trying again.',
      code: 'auth/too-many-requests'
    };
  }

  // 10. Invalid Email
  if (
    errorCode === 'auth/invalid-email' ||
    rawMessage.includes('invalid-email') ||
    errString.includes('invalid-email')
  ) {
    return {
      title: 'Invalid Email',
      message: 'Please enter a valid email address (e.g. chef@example.com).',
      code: 'auth/invalid-email'
    };
  }

  // 11. Weak Password
  if (
    errorCode === 'auth/weak-password' ||
    rawMessage.includes('weak-password') ||
    errString.includes('weak-password')
  ) {
    return {
      title: 'Weak Password',
      message: 'Password must be at least 8 characters long.',
      code: 'auth/weak-password'
    };
  }

  // 12. Account Disabled
  if (
    errorCode === 'auth/user-disabled' ||
    rawMessage.includes('user-disabled') ||
    errString.includes('user-disabled')
  ) {
    return {
      title: 'Account Disabled',
      message: 'This user account has been disabled. Please contact support.',
      code: 'auth/user-disabled'
    };
  }

  // 13. Operation Not Allowed
  if (
    errorCode === 'auth/operation-not-allowed' ||
    rawMessage.includes('operation-not-allowed') ||
    errString.includes('operation-not-allowed')
  ) {
    return {
      title: 'Sign-in Method Disabled',
      message: 'This sign-in method is currently disabled. Please try another sign-in option.',
      code: 'auth/operation-not-allowed'
    };
  }

  // 14. Internal Error
  if (
    errorCode === 'auth/internal-error' ||
    rawMessage.includes('internal-error') ||
    errString.includes('internal-error')
  ) {
    return {
      title: 'Authentication Problem',
      message: 'An internal authentication error occurred. Please refresh the page and try again.',
      code: 'auth/internal-error'
    };
  }

  // Check if string message is passed and sanitize raw technical details
  let cleanMsg = typeof err === 'string' ? err : err?.message || '';

  // If cleanMsg contains any raw Firebase error pattern like "Firebase: Error (auth/...)"
  if (cleanMsg.includes('Firebase:') || cleanMsg.includes('auth/')) {
    cleanMsg = 'An unexpected authentication error occurred. Please try again.';
  }

  if (!cleanMsg || cleanMsg.trim().length === 0) {
    cleanMsg = 'An unexpected authentication error occurred. Please try again.';
  }

  return {
    title: 'Authentication Error',
    message: cleanMsg
  };
}
