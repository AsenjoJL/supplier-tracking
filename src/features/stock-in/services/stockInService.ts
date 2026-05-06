import { orderBy } from "firebase/firestore";
import { addDocument, deleteDocument, getDocs, updateDocument } from "@/lib/firebase/firestore";
import type { StockIn } from "@/features/stock-in/types/stock-in.types";
import type { FirestoreDoc } from "@/types/global.types";

const collectionName = "stockInTransactions";
type StockInCreate = Omit<StockIn, "createdAt">;

export const stockInService = {
  list: (): Promise<FirestoreDoc<StockIn>[]> => getDocs<StockIn>(collectionName, [orderBy("date", "desc")]),
  create: (payload: StockInCreate): Promise<string> => addDocument<StockIn>(collectionName, payload),
  update: (id: string, payload: Partial<StockInCreate>): Promise<void> => updateDocument<StockIn>(collectionName, id, payload),
  remove: (id: string): Promise<void> => deleteDocument(collectionName, id),
};
