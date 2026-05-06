import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { cropService } from "@/features/crop-monitoring/services/cropService";

export function useCrops() {
  return useQuery({
    queryKey: queryKeys.crops.lists(),
    queryFn: cropService.list,
  });
}
