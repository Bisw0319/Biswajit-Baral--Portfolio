// Firebase Cloud Database Integration for Multi-Device Realtime Sync
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';

const FIREBASE_CONFIG_KEY = 'biswajit_firebase_config';

// Default / fallback Firebase configuration
// Can be populated via .env (VITE_FIREBASE_API_KEY, etc.) or pasted via Admin Portal
const getDefaultConfig = () => {
  try {
    const stored = localStorage.getItem(FIREBASE_CONFIG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Could not read stored Firebase config:", e);
  }

  // Check Vite Environment Variables
  const env = import.meta.env || {};
  if (env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || `${env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || `${env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: env.VITE_FIREBASE_APP_ID || ""
    };
  }

  return null;
};

let appInstance = null;
let dbInstance = null;

export const isFirebaseConfigured = () => {
  const config = getDefaultConfig();
  return Boolean(config && config.apiKey && config.projectId && !config.apiKey.includes('YOUR_'));
};

export const getFirebaseApp = () => {
  const config = getDefaultConfig();
  if (!config || !config.apiKey || !config.projectId) return null;

  try {
    if (!appInstance) {
      appInstance = getApps().length > 0 ? getApp() : initializeApp(config);
    }
    return appInstance;
  } catch (e) {
    console.error("Firebase App Initialization Error:", e);
    return null;
  }
};

export const getFirebaseDb = () => {
  if (dbInstance) return dbInstance;
  const app = getFirebaseApp();
  if (!app) return null;

  try {
    dbInstance = getFirestore(app);
    return dbInstance;
  } catch (e) {
    console.error("Firestore Initialization Error:", e);
    return null;
  }
};

// Store custom Firebase config from Admin Portal
export const setFirebaseConfig = (config) => {
  try {
    if (!config || typeof config !== 'object') {
      localStorage.removeItem(FIREBASE_CONFIG_KEY);
      appInstance = null;
      dbInstance = null;
      return true;
    }
    localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
    appInstance = null;
    dbInstance = null;
    // Re-initialize
    getFirebaseDb();
    window.dispatchEvent(new Event('portfolio_firebase_status_changed'));
    return true;
  } catch (e) {
    console.error("Failed to save Firebase config:", e);
    return false;
  }
};

export const getActiveFirebaseConfig = () => {
  return getDefaultConfig();
};

// Realtime sync listener helper
export const subscribeToCollection = (collectionName, callback) => {
  const db = getFirebaseDb();
  if (!db) return () => {};

  try {
    const colRef = collection(db, collectionName);
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const items = [];
      snapshot.forEach((docSnapshot) => {
        items.push({ id: docSnapshot.id, ...docSnapshot.data() });
      });
      callback(items);
    }, (error) => {
      console.warn(`Firestore subscription error on ${collectionName}:`, error.message);
    });
    return unsubscribe;
  } catch (e) {
    console.warn(`Could not subscribe to ${collectionName}:`, e);
    return () => {};
  }
};

// Cloud Document Save
export const saveCloudDoc = async (collectionName, docId, data) => {
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    const docRef = doc(db, collectionName, String(docId));
    await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (e) {
    console.warn(`Failed to save cloud document ${collectionName}/${docId}:`, e);
    return false;
  }
};

// Cloud Document Delete
export const deleteCloudDoc = async (collectionName, docId) => {
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    const docRef = doc(db, collectionName, String(docId));
    await deleteDoc(docRef);
    return true;
  } catch (e) {
    console.warn(`Failed to delete cloud document ${collectionName}/${docId}:`, e);
    return false;
  }
};
