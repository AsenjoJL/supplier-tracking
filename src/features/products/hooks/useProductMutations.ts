import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/features/products/services/productService";
import type { ProductFormValues } from "@/features/products/types/product.types";
import { queryKeys } from "@/lib/queryKeys";
import { computeTarhaPricing } from "@/lib/utils";

const withTarhaPricing = (payload: ProductFormValues): ProductFormValues => {
  if (payload.type !== "vegetable") {
    return {
      ...payload,
      tarhaPercent: 0,
      deductionAmount: 0,
      finalPrice: payload.price,
    };
  }

  const { deductionAmount, finalPrice } = computeTarhaPricing(payload.price, payload.tarhaPercent);

  return { ...payload, deductionAmount, finalPrice };
};

export function useProductMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.metrics });
    void queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
  };

  const createProduct = useMutation({
    mutationFn: (payload: ProductFormValues) => productService.create(withTarhaPricing(payload)),
    onSuccess: invalidate,
  });

  const importProducts = useMutation({
    mutationFn: (payloads: ProductFormValues[]) => productService.createMany(payloads.map(withTarhaPricing)),
    onSuccess: invalidate,
  });

  const updateProduct = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProductFormValues }) => productService.update(id, withTarhaPricing(payload)),
    onSuccess: invalidate,
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => productService.remove(id),
    onSuccess: invalidate,
  });

  return { createProduct, importProducts, updateProduct, deleteProduct };
}
