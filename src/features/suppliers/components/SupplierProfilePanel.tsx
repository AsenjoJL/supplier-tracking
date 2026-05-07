import type { ReactNode } from "react";
import { X } from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { SupplierProfileActivity } from "@/features/suppliers/components/SupplierProfileActivity";
import { SupplierProfileCrops } from "@/features/suppliers/components/SupplierProfileCrops";
import { SupplierProfileDeductions } from "@/features/suppliers/components/SupplierProfileDeductions";
import { SupplierProfileHeader } from "@/features/suppliers/components/SupplierProfileHeader";
import { SupplierProfileProducts } from "@/features/suppliers/components/SupplierProfileProducts";
import { useSupplierDetail } from "@/features/suppliers/hooks/useSupplierDetail";

type SupplierProfilePanelProps = {
  supplierId: string;
  actions?: ReactNode;
  heading?: string | null;
  description?: string | null;
  onClose?: () => void;
};

export function SupplierProfilePanel({
  supplierId,
  actions,
  heading = "Supplier Profile",
  description = "Products, crop monitoring, and inventory movements connected to this supplier.",
  onClose,
}: SupplierProfilePanelProps) {
  const detail = useSupplierDetail(supplierId);
  const hasHeader = Boolean(heading || description || actions || onClose);

  return (
    <div className="rounded-lg border bg-background p-4 shadow-sm">
      {hasHeader ? (
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            {heading ? <h3 className="font-serif text-2xl">{heading}</h3> : null}
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {actions}
            {onClose ? (
              <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close supplier profile">
                <X className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
      {detail.isLoading ? <LoadingSpinner label="Loading supplier profile" /> : null}
      {!detail.isLoading && detail.supplier ? (
        <div className="space-y-6">
          <SupplierProfileHeader
            supplier={detail.supplier}
            productCount={detail.productStock.length}
            activeCropCount={detail.ongoingCrops.length}
            totalStock={detail.totalStock}
            totalInventoryValue={detail.totalInventoryValue}
            openDeductionsTotal={detail.openDeductionsTotal}
          />
          <SupplierProfileDeductions
            supplierId={supplierId}
            deductions={detail.deductionRecords}
            openTotal={detail.openDeductionsTotal}
            settledTotal={detail.settledDeductionsTotal}
          />
          <SupplierProfileProducts productStock={detail.productStock} />
          <SupplierProfileCrops crops={detail.cropRecords} />
          <SupplierProfileActivity stockInRecords={detail.stockInRecords} stockOutRecords={detail.stockOutRecords} />
        </div>
      ) : null}
      {!detail.isLoading && !detail.supplier ? (
        <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">Supplier profile was not found.</p>
      ) : null}
    </div>
  );
}
