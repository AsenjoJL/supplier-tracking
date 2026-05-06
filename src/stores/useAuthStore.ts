import type { User } from "firebase/auth";
import { create } from "zustand";

type AuthState = {
  user: User | null;
  initialized: boolean;
  setUser: (user: User | null) => void;
  clearUser: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initialized: false,
  setUser: (user) => set({ user, initialized: true }),
  clearUser: () => set({ user: null, initialized: true }),
}));
