import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc as getFirestoreDoc,
  getDocs as getFirestoreDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  type DocumentData,
  type DocumentSnapshot,
  type QueryConstraint,
  type UpdateData,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type { FirestoreDoc, PaginatedResult } from "@/types/global.types";

type CreatePayload<T extends object> = Omit<T, "createdAt"> & Partial<Pick<T, Extract<keyof T, "createdAt">>>;
type UpdatePayload<T extends object> = Partial<T>;

export async function getDoc<T extends object>(
  collectionName: string,
  id: string,
): Promise<FirestoreDoc<T> | null> {
  const snapshot = await getFirestoreDoc(doc(db, collectionName, id));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...(snapshot.data() as T) };
}

export async function getDocs<T extends object>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
): Promise<FirestoreDoc<T>[]> {
  const snapshot = await getFirestoreDocs(query(collection(db, collectionName), ...constraints));
  return snapshot.docs.map((document) => ({
    id: document.id,
    ...(document.data() as T),
  }));
}

export async function getPaginatedDocs<T extends object>(
  collectionName: string,
  pageSize: number,
  cursor?: DocumentSnapshot<DocumentData> | null,
  constraints: QueryConstraint[] = [],
): Promise<PaginatedResult<T>> {
  const cursorConstraints = cursor ? [startAfter(cursor)] : [];
  const snapshot = await getFirestoreDocs(
    query(collection(db, collectionName), orderBy("createdAt", "desc"), ...constraints, ...cursorConstraints, limit(pageSize)),
  );

  return {
    items: snapshot.docs.map((document) => ({
      id: document.id,
      ...(document.data() as T),
    })),
    nextCursor: snapshot.docs.at(-1) ?? null,
  };
}

export async function addDocument<T extends object>(
  collectionName: string,
  payload: CreatePayload<T>,
): Promise<string> {
  const reference = await addDoc(collection(db, collectionName), {
    ...payload,
    createdAt: serverTimestamp(),
  });
  return reference.id;
}

export async function updateDocument<T extends object>(
  collectionName: string,
  id: string,
  payload: UpdatePayload<T>,
): Promise<void> {
  await updateDoc(doc(db, collectionName, id), payload as UpdateData<DocumentData>);
}

export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  await deleteDoc(doc(db, collectionName, id));
}
