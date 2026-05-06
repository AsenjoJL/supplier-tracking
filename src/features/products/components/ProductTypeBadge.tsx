import { StatusBadge } from "@/components/common/StatusBadge";
import type { ProductType } from "@/features/products/types/product.types";

export function ProductTypeBadge({ type }: { type: ProductType }) {
  return <StatusBadge status={type} />;
}
