import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  browserPopupRedirectResolver,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase.js';
import { createUserProfile } from './userService.js';

export async function registerUser(email, password, name) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await createUserProfile(cred.user, { name, role: 'admin' });
  return cred.user;
}

export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function loginWithGoogle() {
  const cred = await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
  await createUserProfile(cred.user, {
    name: cred.user.displayName,
    role: 'admin',
    photoURL: cred.user.photoURL,
  });
  return cred.user;
}

export async function logoutUser() {
  await signOut(auth);
}
