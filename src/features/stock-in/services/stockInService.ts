import { orderBy } from "firebase/firestore";
import { addDocument, deleteDocument, getDocs, subscribeDocs, updateDocument } from "@/lib/firebase/firestore";
import type { StockIn } from "@/features/stock-in/types/stock-in.types";
import type { FirestoreDoc } from "@/types/global.types";

const collectionName = "stockInTransactions";
type StockInCreate = Omit<StockIn, "createdAt">;

export const stockInService = {
  list: (): Promise<FirestoreDoc<StockIn>[]> => getDocs<StockIn>(collectionName, [orderBy("date", "desc")]),
  subscribeList: (
    onNext: (items: FirestoreDoc<StockIn>[]) => void,
    onError?: (error: Error) => void,
  ): (() => void) => subscribeDocs<StockIn>(collectionName, [orderBy("date", "desc")], onNext, onError),
  create: (payload: StockInCreate): Promise<string> => addDocument<StockIn>(collectionName, payload),
  update: (id: string, payload: Partial<StockInCreate>): Promise<void> => updateDocument<StockIn>(collectionName, id, payload),
  remove: (id: string): Promise<void> => deleteDocument(collectionName, id),
};
