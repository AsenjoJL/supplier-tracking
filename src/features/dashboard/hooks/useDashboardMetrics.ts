import { useMemo } from "react";
import { useCrops } from "@/features/crop-monitoring/hooks/useCrops";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useStockIn } from "@/features/stock-in/hooks/useStockIn";
import { useStockOut } from "@/features/stock-out/hooks/useStockOut";
import { useSuppliers } from "@/features/suppliers/hooks/useSuppliers";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { computeNetStockInQty, computeStockBalance, todayISO } from "@/lib/utils";

export function useDashboardMetrics() {
  const suppliers = useSuppliers();
  const products = useProducts();
  const stockIns = useStockIn();
  const stockOuts = useStockOut();
  const crops = useCrops();

  const metrics = useMemo(() => {
    const stockRows = (products.data ?? []).map((product) => ({
      product,
      currentStock: computeStockBalance(product.id, stockIns.data ?? [], stockOuts.data ?? []),
    }));
    const lowStock = stockRows.filter((row) => row.currentStock <= LOW_STOCK_THRESHOLD && row.currentStock > 0);
    const outOfStock = stockRows.filter((row) => row.currentStock <= 0);
    const activeCrops = (crops.data ?? []).filter((crop) => !["harvested", "failed"].includes(crop.status));
    const upcomingHarvest = (crops.data ?? [])
      .filter((crop) => crop.forecastHarvest >= todayISO() && !crop.actualHarvest)
      .sort((a, b) => a.forecastHarvest.localeCompare(b.forecastHarvest))
      .slice(0, 5);
    const recentTransactions = [
      ...(stockIns.data ?? []).map((item) => ({ ...item, movementType: "in" as const })),
      ...(stockOuts.data ?? []).map((item) => ({ ...item, movementType: "out" as const })),
    ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
    const totalStockInUnits = (stockIns.data ?? []).reduce((sum, item) => sum + computeNetStockInQty(item.qty, item.tarhaQty), 0);

    return {
      activeSuppliers: (suppliers.data ?? []).filter((supplier) => supplier.status === "active").length,
      totalSuppliers: suppliers.data?.length ?? 0,
      activeCrops,
      lowStock,
      outOfStock,
      stockRows,
      upcomingHarvest,
      recentTransactions,
      totalStockInUnits,
      products: products.data ?? [],
    };
  }, [crops.data, products.data, stockIns.data, stockOuts.data, suppliers.data]);

  return {
    ...metrics,
    isLoading: suppliers.isLoading || products.isLoading || stockIns.isLoading || stockOuts.isLoading || crops.isLoading,
  };
}
