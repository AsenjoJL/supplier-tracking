import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { productService } from "@/features/products/services/productService";

export function useProducts() {
  return useQuery({
    queryKey: queryKeys.products.lists(),
    queryFn: productService.list,
  });
}
