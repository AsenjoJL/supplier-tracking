import { orderBy } from "firebase/firestore";
import { addDocument, deleteDocument, getDocs, subscribeDocs, updateDocument } from "@/lib/firebase/firestore";
import type { SupplierDeduction, SupplierDeductionFormValues } from "@/features/suppliers/types/supplier-deduction.types";
import type { FirestoreDoc } from "@/types/global.types";

const collectionName = "supplierDeductions";

export const supplierDeductionService = {
  list: (): Promise<FirestoreDoc<SupplierDeduction>[]> => getDocs<SupplierDeduction>(collectionName, [orderBy("date", "desc")]),
  subscribeList: (
    onNext: (items: FirestoreDoc<SupplierDeduction>[]) => void,
    onError?: (error: Error) => void,
  ): (() => void) => subscribeDocs<SupplierDeduction>(collectionName, [orderBy("date", "desc")], onNext, onError),
  create: (payload: SupplierDeductionFormValues): Promise<string> => addDocument<SupplierDeduction>(collectionName, payload),
  update: (id: string, payload: SupplierDeductionFormValues): Promise<void> => updateDocument<SupplierDeduction>(collectionName, id, payload),
  remove: (id: string): Promise<void> => deleteDocument(collectionName, id),
};
