import { orderBy } from "firebase/firestore";
import { addDocument, deleteDocument, getDocs, updateDocument } from "@/lib/firebase/firestore";
import type { Product, ProductFormValues } from "@/features/products/types/product.types";
import type { FirestoreDoc } from "@/types/global.types";

const collectionName = "products";

export const productService = {
  list: (): Promise<FirestoreDoc<Product>[]> => getDocs<Product>(collectionName, [orderBy("createdAt", "desc")]),
  create: (payload: ProductFormValues): Promise<string> => addDocument<Product>(collectionName, payload),
  createMany: (payloads: ProductFormValues[]): Promise<string[]> =>
    Promise.all(payloads.map((payload) => addDocument<Product>(collectionName, payload))),
  update: (id: string, payload: ProductFormValues): Promise<void> => updateDocument<Product>(collectionName, id, payload),
  remove: (id: string): Promise<void> => deleteDocument(collectionName, id),
};
