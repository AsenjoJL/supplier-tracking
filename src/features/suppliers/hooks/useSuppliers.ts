import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { supplierService } from "@/features/suppliers/services/supplierService";

export function useSuppliers() {
  return useQuery({
    queryKey: queryKeys.suppliers.lists(),
    queryFn: supplierService.list,
  });
}
