import { useMemo } from "react";
import { useCrops } from "@/features/crop-monitoring/hooks/useCrops";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useStockIn } from "@/features/stock-in/hooks/useStockIn";
import { useStockOut } from "@/features/stock-out/hooks/useStockOut";
import { useSuppliers } from "@/features/suppliers/hooks/useSuppliers";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { computeStockBalance } from "@/lib/utils";

export function useReports() {
  const products = useProducts();
  const suppliers = useSuppliers();
  const stockIns = useStockIn();
  const stockOuts = useStockOut();
  const crops = useCrops();

  const data = useMemo(() => {
    const stockRows = (products.data ?? []).map((product) => {
      const totalIn = (stockIns.data ?? []).filter((item) => item.productId === product.id).reduce((sum, item) => sum + item.qty, 0);
      const totalOut = (stockOuts.data ?? []).filter((item) => item.productId === product.id).reduce((sum, item) => sum + item.qty, 0);
      return {
        product,
        supplier: suppliers.data?.find((supplier) => supplier.id === product.supplierId) ?? null,
        totalIn,
        totalOut,
        currentStock: computeStockBalance(product.id, stockIns.data ?? [], stockOuts.data ?? []),
      };
    });

    return {
      stockRows,
      lowItems: stockRows.filter((row) => row.currentStock <= LOW_STOCK_THRESHOLD),
      tarhaRows: (stockIns.data ?? []).filter((item) => item.tarhaQty > 0),
      harvestRows: crops.data ?? [],
      summary: {
        stockInCount: stockIns.data?.length ?? 0,
        stockOutCount: stockOuts.data?.length ?? 0,
        tarhaDeductions: (stockIns.data ?? []).reduce((sum, item) => sum + item.tarhaQty * item.originalPrice, 0),
        activeCrops: (crops.data ?? []).filter((crop) => !["harvested", "failed"].includes(crop.status)).length,
      },
    };
  }, [crops.data, products.data, stockIns.data, stockOuts.data, suppliers.data]);

  return {
    ...data,
    products: products.data ?? [],
    suppliers: suppliers.data ?? [],
    stockIns: stockIns.data ?? [],
    stockOuts: stockOuts.data ?? [],
    isLoading: products.isLoading || suppliers.isLoading || stockIns.isLoading || stockOuts.isLoading || crops.isLoading,
  };
}
