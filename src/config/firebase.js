import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const isUsableConfigValue = (value) => {
  if (typeof value !== "string") {
    return false;
  }

  const normalized = value.trim();
  return (
    normalized.length > 0 &&
    !normalized.startsWith("your_") &&
    normalized !== "undefined" &&
    normalized !== "null"
  );
};

const requiredFirebaseValues = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.appId,
];

const hasFirebaseConfig = requiredFirebaseValues.every(isUsableConfigValue);

let app = null;
let authInstance = null;
let dbInstance = null;

if (hasFirebaseConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
  } catch (error) {
    console.warn(
      "[Firebase] Initialization failed. Running in mock mode.",
      error?.message || error,
    );
  }
}

export const isFirebaseConfigured = !!app && !!authInstance && !!dbInstance;
export const auth = authInstance;
export const db = dbInstance;
