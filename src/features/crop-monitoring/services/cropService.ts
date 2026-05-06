import { orderBy } from "firebase/firestore";
import { addDocument, deleteDocument, getDocs, subscribeDocs, updateDocument } from "@/lib/firebase/firestore";
import type { Crop } from "@/features/crop-monitoring/types/crop.types";
import type { FirestoreDoc } from "@/types/global.types";

const collectionName = "crops";
type CropCreate = Omit<Crop, "createdAt">;

export const cropService = {
  list: (): Promise<FirestoreDoc<Crop>[]> => getDocs<Crop>(collectionName, [orderBy("plantingDate", "desc")]),
  subscribeList: (
    onNext: (items: FirestoreDoc<Crop>[]) => void,
    onError?: (error: Error) => void,
  ): (() => void) => subscribeDocs<Crop>(collectionName, [orderBy("plantingDate", "desc")], onNext, onError),
  create: (payload: CropCreate): Promise<string> => addDocument<Crop>(collectionName, payload),
  update: (id: string, payload: Partial<CropCreate>): Promise<void> => updateDocument<Crop>(collectionName, id, payload),
  remove: (id: string): Promise<void> => deleteDocument(collectionName, id),
};
