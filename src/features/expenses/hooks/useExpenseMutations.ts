import { useMutation, useQueryClient } from "@tanstack/react-query";
import { expenseService } from "@/features/expenses/services/expenseService";
import type { ManualExpenseFormValues } from "@/features/expenses/types/expense.types";
import { queryKeys } from "@/lib/queryKeys";

export function useExpenseMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
  };

  const createExpense = useMutation({
    mutationFn: (payload: ManualExpenseFormValues) => expenseService.create(payload),
    onSuccess: invalidate,
  });

  const updateExpense = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ManualExpenseFormValues }) => expenseService.update(id, payload),
    onSuccess: invalidate,
  });

  const deleteExpense = useMutation({
    mutationFn: (id: string) => expenseService.remove(id),
    onSuccess: invalidate,
  });

  return { createExpense, updateExpense, deleteExpense };
}
