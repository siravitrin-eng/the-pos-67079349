
import { initializeApp } from 'firebase/app';
// Separate the value exports (functions and classes) from the type exports (interfaces) for firebase/auth.
// This resolves issues where the TypeScript compiler fails to locate modular exports when mixed.
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signInAnonymously 
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCxQEhCyEngfoCfq6HS23HoYZP817_jpHw",
  authDomain: "sample-42d87.firebaseapp.com",
  projectId: "sample-42d87",
  storageBucket: "sample-42d87.firebasestorage.app",
  messagingSenderId: "435001863578",
  appId: "1:435001863578:web:b98afadf5e3ec32ec81e23",
  measurementId: "G-YQ6GG1YG56"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInAnonymously };
export type { User };
