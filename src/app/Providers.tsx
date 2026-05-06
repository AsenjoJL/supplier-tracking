import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { authService } from "@/features/auth/services/authService";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUIStore } from "@/stores/useUIStore";

type ProvidersProps = {
  children: ReactNode;
};

function AuthProvider({ children }: ProvidersProps) {
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  useEffect(() => {
    return authService.onAuthStateChanged((user) => {
      if (user) setUser(user);
      else clearUser();
    });
  }, [clearUser, setUser]);

  return children;
}

function ThemeProvider({ children }: ProvidersProps) {
  const theme = useUIStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return children;
}

export function Providers({ children }: ProvidersProps) {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 2 * 60_000,
            gcTime: 10 * 60_000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              if (error instanceof Error && /permission|auth|unauthorized/i.test(error.message)) return false;
              return failureCount < 2;
            },
          },
        },
      }),
    [],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
