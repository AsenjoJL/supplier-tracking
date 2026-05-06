import { create } from "zustand";

type Theme = "light" | "dark";

type UIState = {
  sidebarOpen: boolean;
  theme: Theme;
  toggleSidebar: () => void;
  setTheme: (theme: Theme) => void;
};

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: "light",
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
}));
