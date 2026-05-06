import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { supplierService } from "@/features/suppliers/services/supplierService";
import type { SupplierFormValues } from "@/features/suppliers/types/supplier.types";

export function useSupplierMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.metrics });
  };

  const createSupplier = useMutation({
    mutationFn: (payload: SupplierFormValues) => supplierService.create(payload),
    onSuccess: invalidate,
  });

  const updateSupplier = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SupplierFormValues }) => supplierService.update(id, payload),
    onSuccess: invalidate,
  });

  const deleteSupplier = useMutation({
    mutationFn: (id: string) => supplierService.remove(id),
    onSuccess: invalidate,
  });

  return { createSupplier, updateSupplier, deleteSupplier };
}
