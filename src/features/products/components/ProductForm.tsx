import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FARM_INPUT_TYPES,
  PRODUCT_TARHA_PERCENT_OPTIONS,
  PRODUCT_TYPE_LABELS,
  PRODUCT_TYPES,
  UNIT_OPTIONS,
} from "@/lib/constants";
import { productSchema } from "@/features/products/schemas/product.schema";
import type { Product, ProductFormValues, ProductType } from "@/features/products/types/product.types";
import { useSuppliers } from "@/features/suppliers/hooks/useSuppliers";
import { computeTarhaPricing, formatCurrency } from "@/lib/utils";
import type { FirestoreDoc } from "@/types/global.types";

const defaults: ProductFormValues = {
  name: "",
  type: "vegetable",
  supplierId: "",
  unit: "Kilo",
  price: 0,
  tarhaPercent: 0,
  deductionAmount: 0,
  finalPrice: 0,
  status: "active",
};

type ProductFormProps = {
  open: boolean;
  product?: FirestoreDoc<Product> | null;
  pending?: boolean;
  title?: string;
  allowedTypes?: readonly ProductType[];
  catalogOptions?: readonly ProductFormValues[];
  defaultValuesOverride?: Partial<ProductFormValues>;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ProductFormValues) => void;
};

export function ProductForm({
  open,
  product,
  pending = false,
  title,
  allowedTypes = PRODUCT_TYPES,
  catalogOptions = [],
  defaultValuesOverride,
  onOpenChange,
  onSubmit,
}: ProductFormProps) {
  const suppliers = useSuppliers();
  const resolvedDefaults = useMemo(() => ({ ...defaults, ...defaultValuesOverride }), [defaultValuesOverride]);
  const selectableCatalogProducts = useMemo(
    () => catalogOptions.filter((item) => allowedTypes.includes(item.type)),
    [allowedTypes, catalogOptions],
  );
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: resolvedDefaults,
  });
  const selectedName = form.watch("name");
  const selectedType = form.watch("type");
  const selectedUnit = form.watch("unit");
  const originalPrice = Number(form.watch("price") || 0);
  const tarhaPercent = Number(form.watch("tarhaPercent") || 0);
  const deductionAmount = Number(form.watch("deductionAmount") || 0);
  const finalPrice = Number(form.watch("finalPrice") || 0);
  const usesTarhaPricing = selectedType === "vegetable";
  const productAllowsSupplier = selectedType === "vegetable" || !(FARM_INPUT_TYPES as readonly ProductType[]).includes(selectedType);
  const selectableSuppliers = useMemo(
    () => (productAllowsSupplier ? suppliers.data ?? [] : []),
    [productAllowsSupplier, suppliers.data],
  );

  useEffect(() => {
    const nextValues: ProductFormValues = product
      ? {
        name: product.name,
        type: product.type,
        supplierId: product.supplierId,
        unit: product.unit,
        price: product.price,
        tarhaPercent: product.tarhaPercent ?? 0,
        deductionAmount: product.deductionAmount ?? 0,
        finalPrice: product.finalPrice ?? product.price,
        status: product.status,
      }
      : resolvedDefaults;
    const nextUsesTarhaPricing = nextValues.type === "vegetable";
    const nextTarhaPercent = nextUsesTarhaPricing ? nextValues.tarhaPercent : 0;
    const fallbackPricing = nextUsesTarhaPricing
      ? computeTarhaPricing(nextValues.price, nextTarhaPercent)
      : { deductionAmount: 0, finalPrice: nextValues.price };

    form.reset({
      ...nextValues,
      tarhaPercent: nextTarhaPercent,
      deductionAmount: nextUsesTarhaPricing ? nextValues.deductionAmount ?? fallbackPricing.deductionAmount : 0,
      finalPrice: nextUsesTarhaPricing ? nextValues.finalPrice ?? fallbackPricing.finalPrice : nextValues.price,
    });
  }, [form, product, open, resolvedDefaults]);

  useEffect(() => {
    if (!usesTarhaPricing && tarhaPercent !== 0) {
      form.setValue("tarhaPercent", 0, { shouldDirty: true, shouldValidate: true });
    }

    const nextPricing = usesTarhaPricing
      ? computeTarhaPricing(originalPrice, tarhaPercent)
      : { deductionAmount: 0, finalPrice: originalPrice };
    if (Math.abs(nextPricing.deductionAmount - deductionAmount) > 0.001) {
      form.setValue("deductionAmount", nextPricing.deductionAmount, { shouldDirty: true, shouldValidate: true });
    }
    if (Math.abs(nextPricing.finalPrice - finalPrice) > 0.001) {
      form.setValue("finalPrice", nextPricing.finalPrice, { shouldDirty: true, shouldValidate: true });
    }
  }, [deductionAmount, finalPrice, form, originalPrice, tarhaPercent, usesTarhaPricing]);

  useEffect(() => {
    const supplierId = form.getValues("supplierId");
    if (!supplierId) return;

    const selectedSupplier = suppliers.data?.find((supplier) => supplier.id === supplierId);
    if (!selectedSupplier) return;

    if (!productAllowsSupplier || (selectedSupplier.supplierKind ?? "vegetable") !== "vegetable") {
      form.setValue("supplierId", "", { shouldDirty: true, shouldValidate: true });
    }
  }, [form, productAllowsSupplier, suppliers.data]);

  const applyCatalogProduct = (productName: string) => {
    const selectedProduct = selectableCatalogProducts.find((item) => item.name === productName);
    form.setValue("name", productName, { shouldDirty: true, shouldValidate: true });
    if (!selectedProduct) return;
    const selectedProductUsesTarhaPricing = selectedProduct.type === "vegetable";
    form.setValue("type", selectedProduct.type, { shouldDirty: true, shouldValidate: true });
    form.setValue("unit", selectedProduct.unit, { shouldDirty: true, shouldValidate: true });
    form.setValue("price", selectedProduct.price, { shouldDirty: true, shouldValidate: true });
    form.setValue("tarhaPercent", selectedProductUsesTarhaPricing ? selectedProduct.tarhaPercent : 0, { shouldDirty: true, shouldValidate: true });
  };
  const unitOptions = selectedUnit && !(UNIT_OPTIONS as readonly string[]).includes(selectedUnit)
    ? [...UNIT_OPTIONS, selectedUnit]
    : UNIT_OPTIONS;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title ?? (product ? "Edit Product" : "Add Product")}</DialogTitle>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-name">Product name</Label>
              {selectableCatalogProducts.length > 0 ? (
                <select
                  id="product-name"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={selectedName}
                  onChange={(event) => applyCatalogProduct(event.target.value)}
                >
                  <option value="">Select product</option>
                  {selectedName && !selectableCatalogProducts.some((item) => item.name === selectedName) ? (
                    <option value={selectedName}>{selectedName}</option>
                  ) : null}
                  {selectableCatalogProducts.map((item) => (
                    <option key={item.name} value={item.name}>{item.name}</option>
                  ))}
                </select>
              ) : (
                <Input id="product-name" {...form.register("name")} />
              )}
              {form.formState.errors.name ? <p className="text-sm text-destructive">{form.formState.errors.name.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-type">Type</Label>
              <select id="product-type" className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("type")}>
                {allowedTypes.map((type) => <option key={type} value={type}>{PRODUCT_TYPE_LABELS[type]}</option>)}
              </select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier <span className="text-muted-foreground">(optional)</span></Label>
              <select id="supplier" className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("supplierId")}>
                <option value="">Unassigned</option>
                {selectableSuppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-status">Status</Label>
              <select id="product-status" className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("status")}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <select id="unit" className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("unit")}>
                {unitOptions.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">{usesTarhaPricing ? "Original price" : "Unit price"}</Label>
              <Input id="price" type="number" step="0.01" {...form.register("price")} />
            </div>
          </div>
          {usesTarhaPricing ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="tarha-percent">Tarha Percent</Label>
                <select
                  id="tarha-percent"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  {...form.register("tarhaPercent")}
                >
                  {PRODUCT_TARHA_PERCENT_OPTIONS.map((percent) => (
                    <option key={percent} value={percent}>{percent}%</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Deduction Amount</Label>
                <div className="flex h-9 items-center rounded-md border bg-muted/30 px-3 text-sm">
                  {formatCurrency(deductionAmount)}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Final Price</Label>
                <div className="flex h-9 items-center rounded-md border bg-muted/30 px-3 text-sm font-semibold text-leaf-700">
                  {formatCurrency(finalPrice)}
                </div>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save product"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
