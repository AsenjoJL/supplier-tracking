import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { stockOutService } from "@/features/stock-out/services/stockOutService";

export function useStockOut() {
  return useQuery({
    queryKey: queryKeys.stockOut.lists(),
    queryFn: stockOutService.list,
  });
}
