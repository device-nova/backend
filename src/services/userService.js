import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase.js';

export async function createUserProfile(user, extra = {}) {
  try {
    const ref = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);

    const profile = {
      uid: user.uid,
      name: extra.name || user.displayName || '',
      email: user.email || '',
      role: extra.role || 'user',
      photoURL: extra.photoURL || user.photoURL || '',
      createdAt: serverTimestamp(),
    };

    if (snap.exists()) {
      const existing = snap.data();
      if (!existing.photoURL && profile.photoURL) {
        await updateDoc(ref, { photoURL: profile.photoURL });
      }
      return { ...existing, ...profile };
    }

    await setDoc(ref, profile);
    return profile;
  } catch {
    return null;
  }
}

export async function getUserProfile(uid) {
  try {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch {
    return null;
  }
}

export async function updateUserProfile(uid, data) {
  try {
    const ref = doc(db, 'users', uid);
    await updateDoc(ref, data);
  } catch {
    /* silent */
  }
}

export async function updateUserPhoto(uid, photoURL) {
  try {
    const ref = doc(db, 'users', uid);
    await updateDoc(ref, { photoURL });
  } catch {
    /* silent */
  }
}
