import { useMutation, useQueryClient } from "@tanstack/react-query";
import { expenseService } from "@/features/expenses/services/expenseService";
import type { ManualExpenseFormValues } from "@/features/expenses/types/expense.types";
import { queryKeys } from "@/lib/queryKeys";
import { withRateLimit } from "@/lib/rateLimit";

export function useExpenseMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
  };

  const createExpense = useMutation({
    mutationFn: withRateLimit<ManualExpenseFormValues, string>("expenses:create", (payload) => expenseService.create(payload)),
    onSuccess: invalidate,
  });

  const updateExpense = useMutation({
    mutationFn: withRateLimit<{ id: string; payload: ManualExpenseFormValues }, void>("expenses:update", ({ id, payload }) =>
      expenseService.update(id, payload),
    ),
    onSuccess: invalidate,
  });

  const deleteExpense = useMutation({
    mutationFn: withRateLimit<string, void>("expenses:delete", (id) => expenseService.remove(id)),
    onSuccess: invalidate,
  });

  return { createExpense, updateExpense, deleteExpense };
}
