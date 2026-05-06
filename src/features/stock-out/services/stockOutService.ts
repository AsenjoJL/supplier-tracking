import { orderBy } from "firebase/firestore";
import { addDocument, deleteDocument, getDocs, updateDocument } from "@/lib/firebase/firestore";
import type { StockOut } from "@/features/stock-out/types/stock-out.types";
import type { FirestoreDoc } from "@/types/global.types";

const collectionName = "stockOutTransactions";
type StockOutCreate = Omit<StockOut, "createdAt">;

export const stockOutService = {
  list: (): Promise<FirestoreDoc<StockOut>[]> => getDocs<StockOut>(collectionName, [orderBy("date", "desc")]),
  create: (payload: StockOutCreate): Promise<string> => addDocument<StockOut>(collectionName, payload),
  update: (id: string, payload: Partial<StockOutCreate>): Promise<void> => updateDocument<StockOut>(collectionName, id, payload),
  remove: (id: string): Promise<void> => deleteDocument(collectionName, id),
};
