import { queryKeys } from "@/lib/queryKeys";
import { cropService } from "@/features/crop-monitoring/services/cropService";
import { useRealtimeCollectionQuery } from "@/hooks/useRealtimeCollectionQuery";

export function useCrops() {
  return useRealtimeCollectionQuery({
    queryKey: queryKeys.crops.lists(),
    queryFn: cropService.list,
    subscribe: cropService.subscribeList,
  });
}
