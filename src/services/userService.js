import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase.js';

export async function createUserProfile(user, extra = {}) {
  try {
    const ref = doc(db, 'users', user.uid);
    await setDoc(ref, {
      uid: user.uid,
      email: user.email || '',
      firstName: extra.firstName || '',
      lastName: extra.lastName || '',
      displayName: extra.displayName || user.displayName || '',
      role: extra.role || 'user',
      photoURL: extra.photoURL || user.photoURL || '',
      createdAt: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.error('[user] createUserProfile error:', err);
  }
}

export async function getUserProfile(uid) {
  try {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.error('[user] getUserProfile error:', err);
    return null;
  }
}

export async function updateUserProfile(uid, data) {
  try {
    const ref = doc(db, 'users', uid);
    await updateDoc(ref, data);
  } catch (err) {
    console.error('[user] updateUserProfile error:', err);
  }
}

export async function updateUserPhoto(uid, photoURL) {
  try {
    const ref = doc(db, 'users', uid);
    await updateDoc(ref, { photoURL });
  } catch (err) {
    console.error('[user] updateUserPhoto error:', err);
  }
}
