import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useSuppliers } from "@/features/suppliers/hooks/useSuppliers";
import { cropSchema } from "@/features/crop-monitoring/schemas/crop.schema";
import type { Crop, CropFormValues } from "@/features/crop-monitoring/types/crop.types";
import { CROP_QUANTITY_UNITS, CROP_STATUS_LABELS, CROP_STATUSES } from "@/lib/constants";
import { addDaysToISODate, formatDate, todayISO } from "@/lib/utils";
import type { FirestoreDoc } from "@/types/global.types";

const defaults: CropFormValues = {
  supplierId: "",
  name: "",
  plantingDate: todayISO(),
  daysToHarvest: 30,
  actualHarvest: null,
  qty: 0,
  qtyUnit: "pcs",
  status: "planted",
  remarks: "",
};

type CropFormProps = {
  open: boolean;
  crop?: FirestoreDoc<Crop> | null;
  pending?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CropFormValues) => void;
};

export function CropForm({ open, crop, pending = false, onOpenChange, onSubmit }: CropFormProps) {
  const suppliers = useSuppliers();
  const products = useProducts();
  const form = useForm<CropFormValues>({
    resolver: zodResolver(cropSchema),
    defaultValues: defaults,
  });
  const selectedCropName = form.watch("name");
  const plantingDate = form.watch("plantingDate");
  const daysToHarvest = Number(form.watch("daysToHarvest") || 0);
  const forecast = plantingDate && daysToHarvest ? addDaysToISODate(plantingDate, daysToHarvest) : "";
  const vegetableSuppliers = useMemo(
    () => (suppliers.data ?? []).filter((supplier) => {
      const supplierKind = supplier.supplierKind ?? "vegetable";
      return supplierKind === "vegetable" || supplierKind === "both";
    }),
    [suppliers.data],
  );
  const vegetableProducts = useMemo(
    () => (products.data ?? []).filter((product) => product.type === "vegetable" && product.status === "active"),
    [products.data],
  );

  useEffect(() => {
    form.reset(crop ? {
      supplierId: crop.supplierId,
      name: crop.name,
      plantingDate: crop.plantingDate,
      daysToHarvest: crop.daysToHarvest,
      actualHarvest: crop.actualHarvest ?? "",
      qty: crop.qty,
      qtyUnit: crop.qtyUnit ?? "pcs",
      status: crop.status,
      remarks: crop.remarks,
    } : defaults);
  }, [crop, form, open]);

  const submit = form.handleSubmit((values) => onSubmit({ ...values, actualHarvest: values.actualHarvest || null }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{crop ? "Edit Crop Record" : "Add Crop Record"}</DialogTitle>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={submit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Crop name</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("name")}>
                <option value="">Select vegetable</option>
                {selectedCropName && !vegetableProducts.some((product) => product.name === selectedCropName) ? (
                  <option value={selectedCropName}>{selectedCropName}</option>
                ) : null}
                {vegetableProducts.map((product) => <option key={product.id} value={product.name}>{product.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Supplier</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("supplierId")}>
                <option value="">Select supplier</option>
                {vegetableSuppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Planting date</Label>
              <Input type="date" {...form.register("plantingDate")} />
            </div>
            <div className="space-y-2">
              <Label>Days to harvest</Label>
              <Input type="number" {...form.register("daysToHarvest")} />
            </div>
            <div className="space-y-2">
              <Label>Forecast harvest</Label>
              <div className="flex h-9 items-center rounded-md border bg-muted/40 px-3 text-sm">{formatDate(forecast)}</div>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 md:col-span-2">
              <Label>Quantity planted</Label>
              <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
                <Input type="number" {...form.register("qty")} />
                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("qtyUnit")}>
                  {CROP_QUANTITY_UNITS.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("status")}>
                {CROP_STATUSES.map((status) => <option key={status} value={status}>{CROP_STATUS_LABELS[status]}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Actual harvest</Label>
              <Input type="date" {...form.register("actualHarvest")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Remarks</Label>
            <Textarea {...form.register("remarks")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save crop"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
