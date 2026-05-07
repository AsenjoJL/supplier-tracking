import { useRealtimeCollectionQuery } from "@/hooks/useRealtimeCollectionQuery";
import { supplierDeductionService } from "@/features/suppliers/services/supplierDeductionService";
import { queryKeys } from "@/lib/queryKeys";

export function useSupplierDeductions() {
  return useRealtimeCollectionQuery({
    queryKey: queryKeys.supplierDeductions.lists(),
    queryFn: supplierDeductionService.list,
    subscribe: supplierDeductionService.subscribeList,
  });
}
