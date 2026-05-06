import { PackageCheck, Sprout, Truck, Users } from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { useDashboardMetrics } from "@/features/dashboard/hooks/useDashboardMetrics";
import { InventoryOverview } from "./InventoryOverview";
import { LowStockAlerts } from "./LowStockAlerts";
import { MetricCard } from "./MetricCard";
import { RecentTransactions } from "./RecentTransactions";
import { UpcomingHarvestList } from "./UpcomingHarvestList";

export function DashboardView() {
  const metrics = useDashboardMetrics();

  if (metrics.isLoading) return <LoadingSpinner />;

  return (
    <PageWrapper title="Dashboard" description="A calm operating view for suppliers, crops, inventory, and harvest timing.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Active suppliers" value={metrics.activeSuppliers} subtext={`${metrics.totalSuppliers} total`} icon={Users} tone="blue" />
        <MetricCard label="Active crops" value={metrics.activeCrops.length} subtext="In field or treatment" icon={Sprout} tone="green" />
        <MetricCard label="Low stock items" value={metrics.lowStock.length + metrics.outOfStock.length} subtext={`${metrics.outOfStock.length} out`} icon={PackageCheck} tone="amber" />
        <MetricCard label="Total stock-in" value={metrics.totalStockInUnits} subtext="Units received" icon={Truck} tone="green" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <LowStockAlerts rows={[...metrics.outOfStock, ...metrics.lowStock]} />
        <UpcomingHarvestList crops={metrics.upcomingHarvest} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <RecentTransactions transactions={metrics.recentTransactions} products={metrics.products} />
        <InventoryOverview rows={metrics.stockRows} />
      </div>
    </PageWrapper>
  );
}
