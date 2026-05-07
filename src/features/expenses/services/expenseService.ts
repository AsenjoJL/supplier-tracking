import { orderBy } from "firebase/firestore";
import { addDocument, deleteDocument, getDocs, subscribeDocs, updateDocument } from "@/lib/firebase/firestore";
import type { ManualExpense, ManualExpenseFormValues } from "@/features/expenses/types/expense.types";
import type { FirestoreDoc } from "@/types/global.types";

const collectionName = "manualExpenses";

export const expenseService = {
  list: (): Promise<FirestoreDoc<ManualExpense>[]> => getDocs<ManualExpense>(collectionName, [orderBy("date", "desc")]),
  subscribeList: (
    onNext: (items: FirestoreDoc<ManualExpense>[]) => void,
    onError?: (error: Error) => void,
  ): (() => void) => subscribeDocs<ManualExpense>(collectionName, [orderBy("date", "desc")], onNext, onError),
  create: (payload: ManualExpenseFormValues): Promise<string> => addDocument<ManualExpense>(collectionName, payload),
  update: (id: string, payload: ManualExpenseFormValues): Promise<void> => updateDocument<ManualExpense>(collectionName, id, payload),
  remove: (id: string): Promise<void> => deleteDocument(collectionName, id),
};
