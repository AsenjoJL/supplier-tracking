import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { stockInService } from "@/features/stock-in/services/stockInService";

export function useStockIn() {
  return useQuery({
    queryKey: queryKeys.stockIn.lists(),
    queryFn: stockInService.list,
  });
}
