// src/firebase/client.ts
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, isSupported, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyDIuH-1JYs7EX8Jd8mN1it4Tdo9XgbKPuo",
  authDomain: "lead-management-3c2d2.firebaseapp.com",
  projectId: "lead-management-3c2d2",
  storageBucket: "lead-management-3c2d2.firebasestorage.app",
  messagingSenderId: "7369187211",
  appId: "1:7369187211:web:72719d23ea039ea2d6998e",
  measurementId: "G-94VK7LQ92X"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let messaging: Messaging | null = null;

// Export a function that returns a Promise of messaging instance if supported
export async function getFirebaseMessaging() {
  if (messaging) return messaging;

  if (typeof window === 'undefined') return null;

  const supported = await isSupported();
  if (!supported) return null;

  messaging = getMessaging(app);
  return messaging;
}

export { app };
