import { StatusBadge } from "@/components/common/StatusBadge";
import type { StockOutPurpose } from "@/features/stock-out/types/stock-out.types";

export function StockOutPurposeBadge({ purpose }: { purpose: StockOutPurpose }) {
  return <StatusBadge status={purpose} />;
}
