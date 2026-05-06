import { useAuthStore } from "@/stores/useAuthStore";

export const useAuth = () => useAuthStore((state) => state.user);
