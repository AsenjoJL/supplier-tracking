import { useMutation } from "@tanstack/react-query";
import { register } from "@/features/auth/services/authService";
import type { RegisterCredentials } from "@/features/auth/types/auth.types";
import { authRateLimit, withRateLimit } from "@/lib/rateLimit";

export function useRegister() {
  return useMutation({
    mutationFn: withRateLimit<RegisterCredentials, Awaited<ReturnType<typeof register>>>("auth:register", register, authRateLimit),
  });
}
