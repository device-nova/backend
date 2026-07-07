import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase.js';
import { createUserProfile } from './userService.js';

const ERROR_MAP = {
  'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact the administrator.',
  'auth/user-not-found': 'No account found with this email address.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/invalid-credential': 'Invalid email or password. Please try again.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password should be at least 6 characters.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/network-request-failed': 'Network error. Please check your internet connection and try again.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/popup-closed-by-user': 'Sign-in cancelled. Please try again.',
  'auth/popup-blocked': 'Sign-in popup was blocked. Please allow popups for this site.',
  'auth/cancelled-popup-request': 'Sign-in cancelled. Please try again.',
  'auth/unauthorized-domain': 'This domain is not authorized for authentication. Please contact support.',
};

function getFirebaseError(error) {
  if (!error) return 'An unexpected error occurred.';
  const code = error.code || '';
  const known = ERROR_MAP[code];
  if (known) return known;
  const message = error.message || '';
  const cleaned = message.replace('Firebase: ', '').replace(/\(.*\)/, '').trim();
  return cleaned || 'An unexpected error occurred. Please try again.';
}

export async function registerUser(email, password, firstName, lastName) {
  try {
    const displayName = `${firstName} ${lastName}`.trim();
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    createUserProfile(cred.user, {
      firstName,
      lastName,
      displayName,
      role: 'admin',
    }).catch((err) => {
      console.warn('[auth] Failed to create user profile:', err);
    });
    return cred.user;
  } catch (error) {
    console.error('[auth] registerUser error:', error.code || error.message);
    throw new Error(getFirebaseError(error));
  }
}

export async function loginUser(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  } catch (error) {
    console.error('[auth] loginUser error:', error.code || error.message);
    throw new Error(getFirebaseError(error));
  }
}

export async function loginWithGoogle() {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    const user = cred.user;
    const names = (user.displayName || '').split(' ');
    const firstName = names[0] || '';
    const lastName = names.slice(1).join(' ') || '';
    createUserProfile(user, {
      firstName,
      lastName,
      displayName: user.displayName,
      role: 'admin',
      photoURL: user.photoURL,
    }).catch((err) => {
      console.warn('[auth] Failed to create Google user profile:', err);
    });
    return user;
  } catch (error) {
    console.error('[auth] loginWithGoogle error:', error.code || error.message);
    throw new Error(getFirebaseError(error));
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('[auth] logoutUser error:', error.code || error.message);
    throw new Error('Failed to sign out. Please try again.');
  }
}

export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('[auth] resetPassword error:', error.code || error.message);
    throw new Error(getFirebaseError(error));
  }
}
