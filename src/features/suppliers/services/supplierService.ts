import { orderBy } from "firebase/firestore";
import { addDocument, deleteDocument, getDocs, subscribeDocs, updateDocument } from "@/lib/firebase/firestore";
import type { FirestoreDoc } from "@/types/global.types";
import type { Supplier, SupplierFormValues } from "@/features/suppliers/types/supplier.types";

const collectionName = "suppliers";

export const supplierService = {
  list: (): Promise<FirestoreDoc<Supplier>[]> => getDocs<Supplier>(collectionName, [orderBy("createdAt", "desc")]),
  subscribeList: (
    onNext: (items: FirestoreDoc<Supplier>[]) => void,
    onError?: (error: Error) => void,
  ): (() => void) => subscribeDocs<Supplier>(collectionName, [orderBy("createdAt", "desc")], onNext, onError),
  create: (payload: SupplierFormValues): Promise<string> => addDocument<Supplier>(collectionName, payload),
  update: (id: string, payload: SupplierFormValues): Promise<void> => updateDocument<Supplier>(collectionName, id, payload),
  remove: (id: string): Promise<void> => deleteDocument(collectionName, id),
};
