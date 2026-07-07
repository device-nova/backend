import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAwBFF75gcitrSmr4NX0FNsfAXld0W-F3k',
  authDomain: 'device-nova-admin.firebaseapp.com',
  projectId: 'device-nova-admin',
  storageBucket: 'device-nova-admin.firebasestorage.app',
  messagingSenderId: '173334588281',
  appId: '1:173334588281:web:4ea22dba74995b1cfd1da8',
  measurementId: 'G-VZW1V4FMDH',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

setPersistence(auth, browserLocalPersistence);
