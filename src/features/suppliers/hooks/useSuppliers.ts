import { queryKeys } from "@/lib/queryKeys";
import { supplierService } from "@/features/suppliers/services/supplierService";
import { useRealtimeCollectionQuery } from "@/hooks/useRealtimeCollectionQuery";

export function useSuppliers() {
  return useRealtimeCollectionQuery({
    queryKey: queryKeys.suppliers.lists(),
    queryFn: supplierService.list,
    subscribe: supplierService.subscribeList,
  });
}
