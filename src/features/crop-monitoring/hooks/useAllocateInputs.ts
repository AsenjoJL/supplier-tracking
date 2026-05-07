import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stockOutService } from "@/features/stock-out/services/stockOutService";
import type { StockOutFormValues } from "@/features/stock-out/types/stock-out.types";
import { queryKeys } from "@/lib/queryKeys";
import { withRateLimit } from "@/lib/rateLimit";

export function useAllocateInputs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: withRateLimit<StockOutFormValues, string>("crops:allocate-inputs", (payload) => stockOutService.create(payload)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.stockOut.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.crops.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.metrics });
    },
  });
}
