import { useEffect } from "react";
import { useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import type { FirestoreDoc } from "@/types/global.types";

type SubscribeList<T extends object> = (
  onNext: (items: FirestoreDoc<T>[]) => void,
  onError?: (error: Error) => void,
) => () => void;

type UseRealtimeCollectionQueryOptions<T extends object> = {
  queryKey: QueryKey;
  queryFn: () => Promise<FirestoreDoc<T>[]>;
  subscribe: SubscribeList<T>;
  enabled?: boolean;
};

type SubscriptionEntry = {
  subscribers: number;
  unsubscribe: () => void;
};

const activeSubscriptions = new Map<string, SubscriptionEntry>();

export function useRealtimeCollectionQuery<T extends object>({
  queryKey,
  queryFn,
  subscribe,
  enabled = true,
}: UseRealtimeCollectionQueryOptions<T>) {
  const queryClient = useQueryClient();
  const queryKeyHash = JSON.stringify(queryKey);
  const query = useQuery({
    queryKey,
    queryFn,
    enabled,
  });

  useEffect(() => {
    if (!enabled) return undefined;

    const existing = activeSubscriptions.get(queryKeyHash);
    if (existing) {
      existing.subscribers += 1;

      return () => {
        existing.subscribers -= 1;
        if (existing.subscribers <= 0) {
          existing.unsubscribe();
          activeSubscriptions.delete(queryKeyHash);
        }
      };
    }

    const unsubscribe = subscribe(
      (items) => queryClient.setQueryData(queryKey, items),
      () => {
        void queryClient.invalidateQueries({ queryKey });
      },
    );
    const entry: SubscriptionEntry = { subscribers: 1, unsubscribe };
    activeSubscriptions.set(queryKeyHash, entry);

    return () => {
      entry.subscribers -= 1;
      if (entry.subscribers <= 0) {
        entry.unsubscribe();
        activeSubscriptions.delete(queryKeyHash);
      }
    };
  }, [enabled, queryClient, queryKeyHash, subscribe]);

  return query;
}
