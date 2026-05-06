import { useMemo } from "react";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useStockIn } from "@/features/stock-in/hooks/useStockIn";
import { useStockOut } from "@/features/stock-out/hooks/useStockOut";
import { FARM_INPUT_TYPES } from "@/lib/constants";
import { computeStockBalance } from "@/lib/utils";

export function useFarmInputs() {
  const products = useProducts();
  const stockIns = useStockIn();
  const stockOuts = useStockOut();

  const rows = useMemo(() => {
    return (products.data ?? [])
      .filter((product) => (FARM_INPUT_TYPES as readonly string[]).includes(product.type))
      .map((product) => ({
        product,
        currentStock: computeStockBalance(product.id, stockIns.data ?? [], stockOuts.data ?? []),
      }));
  }, [products.data, stockIns.data, stockOuts.data]);

  return {
    rows,
    isLoading: products.isLoading || stockIns.isLoading || stockOuts.isLoading,
  };
}
