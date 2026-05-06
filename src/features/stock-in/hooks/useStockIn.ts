import { queryKeys } from "@/lib/queryKeys";
import { stockInService } from "@/features/stock-in/services/stockInService";
import { useRealtimeCollectionQuery } from "@/hooks/useRealtimeCollectionQuery";

export function useStockIn() {
  return useRealtimeCollectionQuery({
    queryKey: queryKeys.stockIn.lists(),
    queryFn: stockInService.list,
    subscribe: stockInService.subscribeList,
  });
}
