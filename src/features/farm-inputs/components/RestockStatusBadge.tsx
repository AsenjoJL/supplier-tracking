import { StatusBadge } from "@/components/common/StatusBadge";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";

export function RestockStatusBadge({ currentStock }: { currentStock: number }) {
  if (currentStock <= 0) return <StatusBadge status="out" label="Out of stock" />;
  if (currentStock <= LOW_STOCK_THRESHOLD) return <StatusBadge status="low" label="Needs restock" />;
  return <StatusBadge status="ok" label="OK" />;
}
