import { queryKeys } from "@/lib/queryKeys";
import { productService } from "@/features/products/services/productService";
import { useRealtimeCollectionQuery } from "@/hooks/useRealtimeCollectionQuery";

export function useProducts() {
  return useRealtimeCollectionQuery({
    queryKey: queryKeys.products.lists(),
    queryFn: productService.list,
    subscribe: productService.subscribeList,
  });
}
