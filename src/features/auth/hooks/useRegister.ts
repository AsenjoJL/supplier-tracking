import { useMutation } from "@tanstack/react-query";
import { register } from "@/features/auth/services/authService";
import type { RegisterCredentials } from "@/features/auth/types/auth.types";

export function useRegister() {
  return useMutation({
    mutationFn: (credentials: RegisterCredentials) => register(credentials),
  });
}
