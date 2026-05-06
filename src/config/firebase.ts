import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { env } from "@/config/env";

export const firebaseApp = initializeApp(env.firebase);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
export const analytics: Promise<Analytics | null> = env.firebase.measurementId
  ? isSupported().then((supported) => (supported ? getAnalytics(firebaseApp) : null))
  : Promise.resolve(null);
