import { queryKeys } from "@/lib/queryKeys";
import { stockOutService } from "@/features/stock-out/services/stockOutService";
import { useRealtimeCollectionQuery } from "@/hooks/useRealtimeCollectionQuery";

export function useStockOut() {
  return useRealtimeCollectionQuery({
    queryKey: queryKeys.stockOut.lists(),
    queryFn: stockOutService.list,
    subscribe: stockOutService.subscribeList,
  });
}
