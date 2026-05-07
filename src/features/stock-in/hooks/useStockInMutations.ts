import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stockInService } from "@/features/stock-in/services/stockInService";
import type { StockIn, StockInFormValues, TarhaReason } from "@/features/stock-in/types/stock-in.types";
import { queryKeys } from "@/lib/queryKeys";
import { withRateLimit } from "@/lib/rateLimit";

const calculateStockInPricing = (qty: number, unitPrice: number, tarhaPercent: number) => {
  const tarhaQty = Number(((qty * tarhaPercent) / 100).toFixed(2));
  const originalTotal = qty * unitPrice;
  const deductionAmount = Number((originalTotal * (tarhaPercent / 100)).toFixed(2));
  const finalPrice = Number(Math.max(0, originalTotal - deductionAmount).toFixed(2));

  return { tarhaQty, deductionAmount, finalPrice };
};

const calculateStockInPricingFromQty = (qty: number, tarhaQty: number, unitPrice: number) => {
  const tarhaPercent = qty > 0 ? Number(((tarhaQty / qty) * 100).toFixed(2)) : 0;
  const originalTotal = qty * unitPrice;
  const deductionAmount = Number((originalTotal * (tarhaPercent / 100)).toFixed(2));
  const finalPrice = Number(Math.max(0, originalTotal - deductionAmount).toFixed(2));

  return { tarhaPercent, deductionAmount, finalPrice };
};

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
      const pricing = calculateStockInPricing(payload.qty, payload.originalPrice, payload.tarhaPercent);

      return stockInService.create({
        ...payload,
        ...pricing,
      });
    }),
    onSuccess: invalidate,
  });

  const updateStockIn = useMutation({
    mutationFn: withRateLimit<{ id: string; payload: StockInFormValues }, void>("stock-in:update", ({ id, payload }) => {
      const pricing = calculateStockInPricing(payload.qty, payload.originalPrice, payload.tarhaPercent);

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
        const pricing = calculateStockInPricingFromQty(stockIn.qty, tarhaQty, stockIn.originalPrice);

        return stockInService.update(id, {
          tarhaQty,
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
