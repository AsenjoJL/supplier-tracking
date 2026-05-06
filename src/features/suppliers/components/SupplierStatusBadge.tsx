import { StatusBadge } from "@/components/common/StatusBadge";
import type { Supplier } from "@/features/suppliers/types/supplier.types";

export function SupplierStatusBadge({ status }: Pick<Supplier, "status">) {
  return <StatusBadge status={status} />;
}
