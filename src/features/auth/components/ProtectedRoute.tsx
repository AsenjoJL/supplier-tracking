import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useAuthStore } from "@/stores/useAuthStore";

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.initialized);

  if (!initialized) return <LoadingSpinner label="Checking session" className="min-h-screen" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

export function PublicOnlyRoute({ children }: ProtectedRouteProps) {
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.initialized);

  if (!initialized) return <LoadingSpinner label="Checking session" className="min-h-screen" />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}
