import { useRealtimeCollectionQuery } from "@/hooks/useRealtimeCollectionQuery";
import { expenseService } from "@/features/expenses/services/expenseService";
import { queryKeys } from "@/lib/queryKeys";

export function useManualExpenses() {
  return useRealtimeCollectionQuery({
    queryKey: queryKeys.expenses.lists(),
    queryFn: expenseService.list,
    subscribe: expenseService.subscribeList,
  });
}
