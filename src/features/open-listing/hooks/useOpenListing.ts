import { useMemo } from "react";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useSuppliers } from "@/features/suppliers/hooks/useSuppliers";
import { useStockIn } from "@/features/stock-in/hooks/useStockIn";
import { useStockOut } from "@/features/stock-out/hooks/useStockOut";
import { computeStockBalance } from "@/lib/utils";

export function useOpenListing() {
  const products = useProducts();
  const suppliers = useSuppliers();
  const stockIns = useStockIn();
  const stockOuts = useStockOut();

  const rows = useMemo(() => {
    return (products.data ?? []).map((product) => {
      const latestStockIn = (stockIns.data ?? [])
        .filter((item) => item.productId === product.id)
        .sort((a, b) => b.date.localeCompare(a.date))[0] ?? null;
      return {
        product,
        supplier: suppliers.data?.find((item) => item.id === product.supplierId) ?? null,
        currentStock: computeStockBalance(product.id, stockIns.data ?? [], stockOuts.data ?? []),
        latestStockIn,
      };
    });
  }, [products.data, stockIns.data, stockOuts.data, suppliers.data]);

  return {
    rows,
    isLoading: products.isLoading || suppliers.isLoading || stockIns.isLoading || stockOuts.isLoading,
  };
}
