import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProducts } from "@/features/products/hooks/useProducts";
import { stockInSchema } from "@/features/stock-in/schemas/stock-in.schema";
import type { StockInFormValues } from "@/features/stock-in/types/stock-in.types";
import { useSuppliers } from "@/features/suppliers/hooks/useSuppliers";
import { FARM_INPUT_TYPES, PRODUCT_TYPE_LABELS, PRODUCT_TYPES, STOCK_IN_PRICE_OPTIONS, SUPPLIER_KIND_LABELS, UNIT_OPTIONS } from "@/lib/constants";
import { formatCurrency, todayISO } from "@/lib/utils";
import { TarhaDeductionField } from "./TarhaDeductionField";

const defaults: StockInFormValues = {
  supplierId: "",
  productId: "",
  qty: 0,
  unit: "",
  originalPrice: 0,
  tarhaPercent: 0,
  tarhaQty: 0,
  deductionAmount: 0,
  tarhaReason: null,
  purpose: "Delivery",
  date: todayISO(),
  remarks: "",
};

type StockInFormProps = {
  open: boolean;
  initialValues?: StockInFormValues | null;
  pending?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: StockInFormValues) => void;
};

export function StockInForm({ open, initialValues = null, pending = false, onOpenChange, onSubmit }: StockInFormProps) {
  const suppliers = useSuppliers();
  const products = useProducts();
  const form = useForm<StockInFormValues>({
    resolver: zodResolver(stockInSchema),
    defaultValues: defaults,
  });
  const supplierId = form.watch("supplierId");
  const productId = form.watch("productId");
  const qty = Number(form.watch("qty") || 0);
  const unitPrice = Number(form.watch("originalPrice") || 0);
  const selectedUnit = form.watch("unit");
  const selectedSupplier = suppliers.data?.find((supplier) => supplier.id === supplierId) ?? null;
  const selectedSupplierKind = selectedSupplier?.supplierKind ?? "vegetable";
  const selectedProduct = products.data?.find((item) => item.id === productId) ?? null;
  const selectedProductIsFarmInput = selectedProduct ? (FARM_INPUT_TYPES as readonly string[]).includes(selectedProduct.type) : false;
  const isFarmInputStockIn = selectedSupplierKind === "farmInput" || selectedProductIsFarmInput;
  const productsForSupplier = supplierId
    ? (products.data ?? []).filter((product) => {
        if (product.supplierId !== supplierId) return false;
        if (selectedSupplierKind === "farmInput") return (FARM_INPUT_TYPES as readonly string[]).includes(product.type);
        if (selectedSupplierKind === "vegetable") return product.type === "vegetable";
        return true;
      })
    : products.data ?? [];
  const productGroups = PRODUCT_TYPES.map((type) => ({
    type,
    products: productsForSupplier.filter((product) => product.type === type),
  })).filter((group) => group.products.length > 0);
  const unitPriceOptions = unitPrice > 0 && !STOCK_IN_PRICE_OPTIONS.includes(unitPrice)
    ? [...STOCK_IN_PRICE_OPTIONS, unitPrice].sort((left, right) => left - right)
    : STOCK_IN_PRICE_OPTIONS;
  const unitOptions = selectedUnit && !(UNIT_OPTIONS as readonly string[]).includes(selectedUnit)
    ? [...UNIT_OPTIONS, selectedUnit]
    : UNIT_OPTIONS;

  useEffect(() => {
    if (open) form.reset(initialValues ?? defaults);
  }, [form, initialValues, open]);

  useEffect(() => {
    if (isFarmInputStockIn) {
      form.setValue("tarhaQty", 0);
      form.setValue("tarhaPercent", 0);
      form.setValue("deductionAmount", 0);
      form.setValue("tarhaReason", null);
      if (!initialValues && form.getValues("purpose") === "Delivery") form.setValue("purpose", "Purchase");
    }
  }, [form, initialValues, isFarmInputStockIn]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{initialValues ? "Edit Stock-In" : "Record Stock-In"}</DialogTitle>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" {...form.register("date")} />
            </div>
            <div className="space-y-2">
              <Label>Supplier <span className="text-muted-foreground">(optional)</span></Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                {...form.register("supplierId")}
                onChange={(event) => {
                  form.setValue("supplierId", event.target.value, { shouldDirty: true, shouldValidate: true });
                  form.setValue("productId", "");
                  form.setValue("unit", "");
                  form.setValue("originalPrice", 0);
                  form.setValue("tarhaPercent", 0);
                  form.setValue("tarhaQty", 0);
                  form.setValue("deductionAmount", 0);
                  form.setValue("tarhaReason", null);
                }}
              >
                <option value="">Unassigned</option>
                {(suppliers.data ?? []).map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name} · {SUPPLIER_KIND_LABELS[supplier.supplierKind ?? "vegetable"]}
                  </option>
                ))}
              </select>
              {selectedSupplier ? <p className="text-xs text-muted-foreground">{SUPPLIER_KIND_LABELS[selectedSupplierKind]} format</p> : null}
            </div>
            <div className="space-y-2">
              <Label>Product</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                {...form.register("productId")}
                onChange={(event) => {
                  const product = products.data?.find((item) => item.id === event.target.value);
                  form.setValue("productId", event.target.value, { shouldDirty: true, shouldValidate: true });
                  form.setValue("unit", product?.unit ?? "");
                  form.setValue("originalPrice", product?.price ?? 0);
                }}
              >
                <option value="">Select product</option>
                {productGroups.map((group) => (
                  <optgroup key={group.type} label={PRODUCT_TYPE_LABELS[group.type]}>
                    {group.products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {supplierId && productsForSupplier.length === 0 ? (
                <p className="text-xs text-destructive">No matching products for this supplier type.</p>
              ) : null}
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
              <Label>Unit price</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={unitPrice > 0 ? String(unitPrice) : ""}
                onChange={(event) => {
                  form.setValue("originalPrice", event.target.value ? Number(event.target.value) : 0, { shouldDirty: true, shouldValidate: true });
                }}
              >
                <option value="">Select price</option>
                {unitPriceOptions.map((price) => (
                  <option key={price} value={price}>{formatCurrency(price)}</option>
                ))}
              </select>
            </div>
          </div>
          {isFarmInputStockIn ? (
            <div className="rounded-md border bg-muted/30 p-4">
              <div className="rounded-md bg-background p-3 text-sm">
                Total cost = {qty || 0} received x {formatCurrency(unitPrice || 0)} ={" "}
                <span className="font-semibold text-leaf-700">{formatCurrency((qty || 0) * (unitPrice || 0))}</span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Farm input stock-in does not use Tarha deductions. Use remarks for batch, invoice, or supplier notes.
              </p>
            </div>
          ) : (
            <TarhaDeductionField form={form} />
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Purpose</Label>
              <Input {...form.register("purpose")} />
            </div>
            <div className="space-y-2">
              <Label>Remarks</Label>
              <Textarea {...form.register("remarks")} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? "Saving..." : initialValues ? "Update stock-in" : "Save stock-in"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
