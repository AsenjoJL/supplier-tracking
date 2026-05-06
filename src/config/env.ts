const readEnv = (key: keyof ImportMetaEnv): string => {
  const value = import.meta.env[key];
  return typeof value === "string" ? value : "";
};

export const env = {
  firebase: {
    apiKey: readEnv("VITE_FIREBASE_API_KEY"),
    authDomain: readEnv("VITE_FIREBASE_AUTH_DOMAIN"),
    projectId: readEnv("VITE_FIREBASE_PROJECT_ID"),
    storageBucket: readEnv("VITE_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: readEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
    appId: readEnv("VITE_FIREBASE_APP_ID"),
    measurementId: readEnv("VITE_FIREBASE_MEASUREMENT_ID"),
  },
};

export const hasFirebaseConfig = [
  env.firebase.apiKey,
  env.firebase.authDomain,
  env.firebase.projectId,
  env.firebase.storageBucket,
  env.firebase.messagingSenderId,
  env.firebase.appId,
].every(Boolean);
