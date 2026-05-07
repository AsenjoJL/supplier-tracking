import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supplierDeductionService } from "@/features/suppliers/services/supplierDeductionService";
import type { SupplierDeductionFormValues } from "@/features/suppliers/types/supplier-deduction.types";
import { queryKeys } from "@/lib/queryKeys";
import { withRateLimit } from "@/lib/rateLimit";

export function useSupplierDeductionMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.supplierDeductions.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all });
  };

  const createDeduction = useMutation({
    mutationFn: withRateLimit<SupplierDeductionFormValues, string>("supplier-deductions:create", (payload) => supplierDeductionService.create(payload)),
    onSuccess: invalidate,
  });

  const updateDeduction = useMutation({
    mutationFn: withRateLimit<{ id: string; payload: SupplierDeductionFormValues }, void>("supplier-deductions:update", ({ id, payload }) =>
      supplierDeductionService.update(id, payload),
    ),
    onSuccess: invalidate,
  });

  const deleteDeduction = useMutation({
    mutationFn: withRateLimit<string, void>("supplier-deductions:delete", (id) => supplierDeductionService.remove(id)),
    onSuccess: invalidate,
  });

  return { createDeduction, updateDeduction, deleteDeduction };
}
