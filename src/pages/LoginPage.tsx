import { Navigate, useLocation } from "react-router-dom";
import { LoginForm } from "@/features/auth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useAuthStore } from "@/stores/useAuthStore";

type RedirectState = {
  from?: {
    pathname?: string;
  };
};

export default function LoginPage() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.initialized);
  const redirectTo = (location.state as RedirectState | null)?.from?.pathname ?? "/dashboard";

  if (!initialized) return <LoadingSpinner label="Checking session" className="min-h-screen" />;
  if (user) return <Navigate to={redirectTo} replace />;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <LoginForm />
    </main>
  );
}
