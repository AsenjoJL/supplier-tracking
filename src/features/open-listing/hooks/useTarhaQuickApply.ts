import { useStockInMutations } from "@/features/stock-in/hooks/useStockInMutations";

export function useTarhaQuickApply() {
  const { updateTarha } = useStockInMutations();
  return updateTarha;
}
