import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/features/auth";

const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const SuppliersPage = lazy(() => import("@/pages/SuppliersPage"));
const ProductsPage = lazy(() => import("@/pages/ProductsPage"));
const OpenListingPage = lazy(() => import("@/pages/OpenListingPage"));
const StockInPage = lazy(() => import("@/pages/StockInPage"));
const StockOutPage = lazy(() => import("@/pages/StockOutPage"));
const FarmInputsPage = lazy(() => import("@/pages/FarmInputsPage"));
const CropMonitoringPage = lazy(() => import("@/pages/CropMonitoringPage"));
const HarvestCalendarPage = lazy(() => import("@/pages/HarvestCalendarPage"));
const TarhaPage = lazy(() => import("@/pages/TarhaPage"));
const ReportsPage = lazy(() => import("@/pages/ReportsPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));

const withSuspense = (node: React.ReactNode) => <Suspense fallback={<LoadingSpinner />}>{node}</Suspense>;

export const router = createBrowserRouter([
  {
    path: "/login",
    element: withSuspense(<LoginPage />),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: withSuspense(<DashboardPage />) },
      { path: "suppliers", element: withSuspense(<SuppliersPage />) },
      { path: "products", element: withSuspense(<ProductsPage />) },
      { path: "open-listing", element: withSuspense(<OpenListingPage />) },
      { path: "stock-in", element: withSuspense(<StockInPage />) },
      { path: "stock-out", element: withSuspense(<StockOutPage />) },
      { path: "farm-inputs", element: withSuspense(<FarmInputsPage />) },
      { path: "crop-monitoring", element: withSuspense(<CropMonitoringPage />) },
      { path: "harvest-calendar", element: withSuspense(<HarvestCalendarPage />) },
      { path: "tarha", element: withSuspense(<TarhaPage />) },
      { path: "reports", element: withSuspense(<ReportsPage />) },
    ],
  },
]);
