import type { Timestamp } from "firebase/firestore";

export type FirestoreDoc<T> = T & {
  id: string;
};

export type CreatedAt = Timestamp | Date | string | null;

export type PaginatedResult<T> = {
  items: FirestoreDoc<T>[];
  nextCursor: unknown | null;
};

export type EntityStatus = "active" | "inactive";
