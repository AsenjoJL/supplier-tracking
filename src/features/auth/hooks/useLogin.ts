import { useMutation } from "@tanstack/react-query";
import { signIn } from "@/features/auth/services/authService";
import type { LoginCredentials } from "@/features/auth/types/auth.types";

export function useLogin() {
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => signIn(credentials),
  });
}
