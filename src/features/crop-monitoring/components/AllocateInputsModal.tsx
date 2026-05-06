import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAllocateInputs } from "@/features/crop-monitoring/hooks/useAllocateInputs";
import type { Crop } from "@/features/crop-monitoring/types/crop.types";
import { useFarmInputs } from "@/features/farm-inputs/hooks/useFarmInputs";
import type { StockOutFormValues } from "@/features/stock-out/types/stock-out.types";
import { todayISO } from "@/lib/utils";
import type { FirestoreDoc } from "@/types/global.types";

type AllocateInputsModalProps = {
  crop: FirestoreDoc<Crop> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AllocateInputsModal({ crop, open, onOpenChange }: AllocateInputsModalProps) {
  const farmInputs = useFarmInputs();
  const allocate = useAllocateInputs();
  const form = useForm<StockOutFormValues>({
    defaultValues: {
      productId: "",
      qty: 0,
      unit: "",
      purpose: "cropMaintenance",
      cropId: crop?.id,
      date: todayISO(),
      remarks: "",
    },
  });
  const productId = form.watch("productId");

  useEffect(() => {
    form.reset({ productId: "", qty: 0, unit: "", purpose: "cropMaintenance", cropId: crop?.id, date: todayISO(), remarks: "" });
  }, [crop?.id, form, open]);

  useEffect(() => {
    const row = farmInputs.rows.find((item) => item.product.id === productId);
    if (row) form.setValue("unit", row.product.unit);
  }, [farmInputs.rows, form, productId]);

  const submit = form.handleSubmit((values) => {
    allocate.mutate({ ...values, cropId: crop?.id }, { onSuccess: () => onOpenChange(false) });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Allocate Input{crop ? ` to ${crop.name}` : ""}</DialogTitle>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label>Farm input</Label>
            <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("productId")}>
              <option value="">Select input</option>
              {farmInputs.rows.map((row) => <option key={row.product.id} value={row.product.id}>{row.product.name}</option>)}
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Quantity used</Label>
              <Input type="number" step="0.01" {...form.register("qty", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Date used</Label>
              <Input type="date" {...form.register("date")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Purpose</Label>
            <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("purpose")}>
              <option value="planting">Planting</option>
              <option value="cropMaintenance">Crop maintenance</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Remarks</Label>
            <Textarea {...form.register("remarks")} />
          </div>
          <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Allocation automatically creates a stock-out transaction.</p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={allocate.isPending}>{allocate.isPending ? "Allocating..." : "Allocate & deduct stock"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
