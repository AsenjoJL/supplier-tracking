import { orderBy } from "firebase/firestore";
import { addDocument, deleteDocument, getDocs, subscribeDocs, updateDocument } from "@/lib/firebase/firestore";
import type { FirestoreDoc } from "@/types/global.types";
import type { Supplier, SupplierFormValues } from "@/features/suppliers/types/supplier.types";

const collectionName = "suppliers";

const isVegetableSupplier = (supplier: FirestoreDoc<Supplier>) => (supplier.supplierKind ?? "vegetable") === "vegetable";

export const supplierService = {
  list: (): Promise<FirestoreDoc<Supplier>[]> => getDocs<Supplier>(collectionName, [orderBy("createdAt", "desc")]).then((items) => items.filter(isVegetableSupplier)),
  subscribeList: (
    onNext: (items: FirestoreDoc<Supplier>[]) => void,
    onError?: (error: Error) => void,
  ): (() => void) => subscribeDocs<Supplier>(collectionName, [orderBy("createdAt", "desc")], (items) => onNext(items.filter(isVegetableSupplier)), onError),
  create: (payload: SupplierFormValues): Promise<string> => addDocument<Supplier>(collectionName, payload),
  update: (id: string, payload: SupplierFormValues): Promise<void> => updateDocument<Supplier>(collectionName, id, payload),
  remove: (id: string): Promise<void> => deleteDocument(collectionName, id),
};
