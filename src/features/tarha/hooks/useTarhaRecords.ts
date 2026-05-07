import { useMemo } from "react";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useStockIn } from "@/features/stock-in/hooks/useStockIn";
import { computeStockInPricing } from "@/lib/utils";

export function useTarhaRecords() {
  const stockIns = useStockIn();
  const products = useProducts();

  const records = useMemo(
    () =>
      (stockIns.data ?? [])
        .filter((item) => item.tarhaQty > 0 && item.tarhaReason)
        .map((stockIn) => ({
          stockIn,
          product: products.data?.find((product) => product.id === stockIn.productId) ?? null,
        })),
    [products.data, stockIns.data],
  );

  return {
    records,
    totalDeductions: records.reduce((sum, record) => {
      const pricing = computeStockInPricing(record.stockIn.qty, record.stockIn.originalPrice, record.stockIn.tarhaQty);
      return sum + (record.stockIn.deductionAmount ?? pricing.deductionAmount);
    }, 0),
    isLoading: stockIns.isLoading || products.isLoading,
  };
}
