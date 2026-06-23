import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBwiRnEE6eTrXCorrT8mdwRpfyRpPFg4gw',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'device-nova.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'device-nova',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'device-nova.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '342649657400',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:342649657400:web:8ab06f2f41a258a71caecd',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-6XRP9DEKG0',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
