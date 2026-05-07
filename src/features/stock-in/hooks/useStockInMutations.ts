import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stockInService } from "@/features/stock-in/services/stockInService";
import type { StockIn, StockInFormValues, TarhaReason } from "@/features/stock-in/types/stock-in.types";
import { queryKeys } from "@/lib/queryKeys";
import { withRateLimit } from "@/lib/rateLimit";
import { computeStockInPricing } from "@/lib/utils";

export function useStockInMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.stockIn.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.metrics });
    void queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
  };

  const createStockIn = useMutation({
    mutationFn: withRateLimit<StockInFormValues, string>("stock-in:create", (payload) => {
      const pricing = computeStockInPricing(payload.qty, payload.originalPrice, payload.tarhaQty);

      return stockInService.create({
        ...payload,
        ...pricing,
      });
    }),
    onSuccess: invalidate,
  });

  const updateStockIn = useMutation({
    mutationFn: withRateLimit<{ id: string; payload: StockInFormValues }, void>("stock-in:update", ({ id, payload }) => {
      const pricing = computeStockInPricing(payload.qty, payload.originalPrice, payload.tarhaQty);

      return stockInService.update(id, {
        ...payload,
        ...pricing,
      });
    }),
    onSuccess: invalidate,
  });

  const updateTarha = useMutation({
    mutationFn: withRateLimit<{ id: string; stockIn: StockIn; tarhaQty: number; tarhaReason: TarhaReason | null }, void>(
      "stock-in:tarha",
      ({ id, stockIn, tarhaQty, tarhaReason }) => {
        const pricing = computeStockInPricing(stockIn.qty, stockIn.originalPrice, tarhaQty);

        return stockInService.update(id, {
          ...pricing,
          tarhaReason,
        });
      },
    ),
    onSuccess: invalidate,
  });

  const deleteStockIn = useMutation({
    mutationFn: withRateLimit<string, void>("stock-in:delete", (id) => stockInService.remove(id)),
    onSuccess: invalidate,
  });

  return { createStockIn, updateStockIn, updateTarha, deleteStockIn };
}
