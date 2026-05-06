import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCrops } from "@/features/crop-monitoring/hooks/useCrops";
import { useProducts } from "@/features/products/hooks/useProducts";
import { stockOutSchema } from "@/features/stock-out/schemas/stock-out.schema";
import type { StockOutFormValues } from "@/features/stock-out/types/stock-out.types";
import { STOCK_OUT_PURPOSE_LABELS, STOCK_OUT_PURPOSES, UNIT_OPTIONS } from "@/lib/constants";
import { todayISO } from "@/lib/utils";

const defaults: StockOutFormValues = {
  productId: "",
  qty: 0,
  unit: "",
  purpose: "sold",
  cropId: "",
  date: todayISO(),
  remarks: "",
};

type StockOutFormProps = {
  open: boolean;
  pending?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: StockOutFormValues) => void;
};

export function StockOutForm({ open, pending = false, onOpenChange, onSubmit }: StockOutFormProps) {
  const products = useProducts();
  const crops = useCrops();
  const form = useForm<StockOutFormValues>({
    resolver: zodResolver(stockOutSchema),
    defaultValues: defaults,
  });
  const productId = form.watch("productId");
  const purpose = form.watch("purpose");
  const selectedUnit = form.watch("unit");
  const unitOptions = selectedUnit && !(UNIT_OPTIONS as readonly string[]).includes(selectedUnit)
    ? [...UNIT_OPTIONS, selectedUnit]
    : UNIT_OPTIONS;

  useEffect(() => {
    if (open) form.reset(defaults);
  }, [form, open]);

  useEffect(() => {
    const product = products.data?.find((item) => item.id === productId);
    if (product) form.setValue("unit", product.unit);
  }, [form, productId, products.data]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record Stock-Out</DialogTitle>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" {...form.register("date")} />
            </div>
            <div className="space-y-2">
              <Label>Product</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("productId")}>
                <option value="">Select product</option>
                {(products.data ?? []).map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input type="number" step="0.01" {...form.register("qty")} />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("unit")}>
                {unitOptions.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Purpose</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("purpose")}>
                {STOCK_OUT_PURPOSES.map((item) => <option key={item} value={item}>{STOCK_OUT_PURPOSE_LABELS[item]}</option>)}
              </select>
            </div>
          </div>
          {purpose === "planting" || purpose === "cropMaintenance" ? (
            <div className="space-y-2">
              <Label>Linked crop</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("cropId")}>
                <option value="">Select crop</option>
                {(crops.data ?? []).map((crop) => <option key={crop.id} value={crop.id}>{crop.name}</option>)}
              </select>
            </div>
          ) : null}
          <div className="space-y-2">
            <Label>Remarks</Label>
            <Textarea {...form.register("remarks")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save stock-out"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
