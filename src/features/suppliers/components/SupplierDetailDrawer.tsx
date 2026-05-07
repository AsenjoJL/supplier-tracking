import { useState } from "react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CropForm } from "@/features/crop-monitoring/components/CropForm";
import { useCropMutations } from "@/features/crop-monitoring/hooks/useCropMutations";
import type { Crop, CropFormValues } from "@/features/crop-monitoring/types/crop.types";
import { SupplierProfileActivity } from "@/features/suppliers/components/SupplierProfileActivity";
import { SupplierProfileCrops } from "@/features/suppliers/components/SupplierProfileCrops";
import { SupplierProfileDeductions } from "@/features/suppliers/components/SupplierProfileDeductions";
import { SupplierProfileHeader } from "@/features/suppliers/components/SupplierProfileHeader";
import { SupplierProfileProducts } from "@/features/suppliers/components/SupplierProfileProducts";
import { useSupplierDetail } from "@/features/suppliers/hooks/useSupplierDetail";
import type { FirestoreDoc } from "@/types/global.types";

type SupplierDetailDrawerProps = {
  supplierId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SupplierDetailDrawer({ supplierId, open, onOpenChange }: SupplierDetailDrawerProps) {
  const detail = useSupplierDetail(supplierId);
  const cropMutations = useCropMutations();
  const [editingCrop, setEditingCrop] = useState<FirestoreDoc<Crop> | null>(null);
  const submitCropEdit = (values: CropFormValues) => {
    if (!editingCrop) return;
    cropMutations.updateCrop.mutate(
      { id: editingCrop.id, payload: values },
      { onSuccess: () => setEditingCrop(null) },
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Supplier Profile</DialogTitle>
            <DialogDescription>
              Products, crop monitoring, and inventory movements connected to this supplier.
            </DialogDescription>
          </DialogHeader>
          {detail.isLoading ? <LoadingSpinner label="Loading supplier details" /> : null}
          {!detail.isLoading && detail.supplier ? (
            <div className="mt-4 space-y-6">
              <SupplierProfileHeader
                supplier={detail.supplier}
                productCount={detail.productStock.length}
                activeCropCount={detail.ongoingCrops.length}
                totalStock={detail.totalStock}
                totalInventoryValue={detail.totalInventoryValue}
                openDeductionsTotal={detail.openDeductionsTotal}
              />
              <SupplierProfileDeductions
                supplierId={supplierId ?? ""}
                deductions={detail.deductionRecords}
                openTotal={detail.openDeductionsTotal}
                settledTotal={detail.settledDeductionsTotal}
              />
              <SupplierProfileProducts
                productStock={detail.productStock}
                title="Owned Vegetables / Products"
                description="Vegetables and products linked to this supplier, with current balances."
              />
              <SupplierProfileCrops crops={detail.cropRecords} onEdit={setEditingCrop} />
              <SupplierProfileActivity stockInRecords={detail.stockInRecords} stockOutRecords={detail.stockOutRecords} />
            </div>
          ) : null}
          {!detail.isLoading && !detail.supplier ? (
            <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">Supplier profile was not found.</p>
          ) : null}
        </DialogContent>
      </Dialog>
      <CropForm
        open={editingCrop !== null}
        crop={editingCrop}
        onOpenChange={(isOpen) => { if (!isOpen) setEditingCrop(null); }}
        onSubmit={submitCropEdit}
        pending={cropMutations.updateCrop.isPending}
      />
    </>
  );
}
