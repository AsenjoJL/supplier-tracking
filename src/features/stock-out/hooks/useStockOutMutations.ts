import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stockOutService } from "@/features/stock-out/services/stockOutService";
import type { StockOutFormValues } from "@/features/stock-out/types/stock-out.types";
import { queryKeys } from "@/lib/queryKeys";

export function useStockOutMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.stockOut.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.metrics });
    void queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
  };

  const createStockOut = useMutation({
    mutationFn: (payload: StockOutFormValues) => stockOutService.create(payload),
    onSuccess: invalidate,
  });

  const deleteStockOut = useMutation({
    mutationFn: (id: string) => stockOutService.remove(id),
    onSuccess: invalidate,
  });

  return { createStockOut, deleteStockOut };
}
