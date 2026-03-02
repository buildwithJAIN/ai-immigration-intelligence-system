import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Prevent multiple inits (fast-refresh safe)
const firebaseConfig = {
  apiKey: "AIzaSyA7qfTLU0ROh--9eeCqQxjaFlBwWDa72bc",
  authDomain: "immigrationguideapp.firebaseapp.com",
  projectId: "immigrationguideapp",
  storageBucket: "immigrationguideapp.firebasestorage.app",
  messagingSenderId: "499213804851",
  appId: "1:499213804851:web:6e4ba95e2893b239b18a46"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 👇 Expo-React Native-safe auth initialization
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // If it's already been initialized (hot-reload), just reuse it
  auth = getAuth(app);
}

const db = getFirestore(app);

export { app, auth, db };
