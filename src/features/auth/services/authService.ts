import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth } from "@/config/firebase";
import type { LoginCredentials, RegisterCredentials } from "@/features/auth/types/auth.types";

export async function signIn(credentials: LoginCredentials): Promise<User> {
  try {
    await setPersistence(auth, browserLocalPersistence);
    const result = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
    return result.user;
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
}

export async function register(credentials: RegisterCredentials): Promise<User> {
  try {
    await setPersistence(auth, browserLocalPersistence);
    const result = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
    await updateProfile(result.user, { displayName: credentials.displayName.trim() });
    return result.user;
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
}

export function signOut() {
  return firebaseSignOut(auth);
}

export function onAuthStateChanged(callback: (user: User | null) => void) {
  return firebaseOnAuthStateChanged(auth, callback);
}

function getAuthErrorMessage(error: unknown): string {
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";

  switch (code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Invalid email or password.";
    case "auth/email-already-in-use":
      return "This email is already registered. Sign in instead.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 6 characters.";
    case "auth/operation-not-allowed":
      return "Email/password authentication is not enabled in Firebase.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a moment before trying again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return error instanceof Error ? error.message : "Authentication failed. Try again.";
  }
}

export const authService = {
  signIn,
  register,
  signOut,
  onAuthStateChanged,
};
