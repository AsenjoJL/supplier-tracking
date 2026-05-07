import { useMutation } from "@tanstack/react-query";
import { signIn } from "@/features/auth/services/authService";
import type { LoginCredentials } from "@/features/auth/types/auth.types";
import { authRateLimit, withRateLimit } from "@/lib/rateLimit";

export function useLogin() {
  return useMutation({
    mutationFn: withRateLimit<LoginCredentials, Awaited<ReturnType<typeof signIn>>>("auth:login", signIn, authRateLimit),
  });
}
