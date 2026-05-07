import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { withRateLimit } from "@/lib/rateLimit";
import { supplierService } from "@/features/suppliers/services/supplierService";
import type { SupplierFormValues } from "@/features/suppliers/types/supplier.types";

export function useSupplierMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.metrics });
  };

  const createSupplier = useMutation({
    mutationFn: withRateLimit<SupplierFormValues, string>("suppliers:create", (payload) => supplierService.create(payload)),
    onSuccess: invalidate,
  });

  const updateSupplier = useMutation({
    mutationFn: withRateLimit<{ id: string; payload: SupplierFormValues }, void>("suppliers:update", ({ id, payload }) => supplierService.update(id, payload)),
    onSuccess: invalidate,
  });

  const deleteSupplier = useMutation({
    mutationFn: withRateLimit<string, void>("suppliers:delete", (id) => supplierService.remove(id)),
    onSuccess: invalidate,
  });

  return { createSupplier, updateSupplier, deleteSupplier };
}
