import { useEffect, useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProducts } from "@/features/products/hooks/useProducts";
import type { SupplierDeductionFormValues, SupplierDeductionInputType, SupplierDeductionMoneyType, SupplierDeductionType } from "@/features/suppliers/types/supplier-deduction.types";
import type { Supplier } from "@/features/suppliers/types/supplier.types";
import {
  SUPPLIER_DEDUCTION_TYPES,
  SUPPLIER_DEDUCTION_TYPE_LABELS,
  UNIT_OPTIONS,
} from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { FirestoreDoc } from "@/types/global.types";
import { computeSupplierInputDeductionAmount, getSupplierDeductionInputFieldConfig, isSupplierInputDeductionType } from "../lib/supplierDeductionUtils";

type SupplierDeductionFormFieldsProps = {
  form: UseFormReturn<SupplierDeductionFormValues>;
  suppliers?: FirestoreDoc<Supplier>[];
  showSupplierSelect?: boolean;
};

export function SupplierDeductionFormFields({
  form,
  suppliers = [],
  showSupplierSelect = false,
}: SupplierDeductionFormFieldsProps) {
  const products = useProducts();
  const selectedType = form.watch("type");
  const selectedProductId = form.watch("inputProductId");
  const selectedUnit = form.watch("inputUnit");
  const inputQty = Number(form.watch("inputQty") || 0);
  const inputUnitPrice = Number(form.watch("inputUnitPrice") || 0);
  const usesInputDeduction = isSupplierInputDeductionType(selectedType);
  const selectedAmount = usesInputDeduction
    ? computeSupplierInputDeductionAmount(inputQty, inputUnitPrice)
    : Number(form.watch("amount") || 0);
  const inputFieldConfig = usesInputDeduction ? getSupplierDeductionInputFieldConfig(selectedType) : null;
  const selectableInputProducts = useMemo(
    () => (products.data ?? []).filter((product) => usesInputDeduction && product.type === selectedType),
    [products.data, selectedType, usesInputDeduction],
  );
  const unitOptions = selectedUnit && !(UNIT_OPTIONS as readonly string[]).includes(selectedUnit)
    ? [...UNIT_OPTIONS, selectedUnit]
    : UNIT_OPTIONS;

  useEffect(() => {
    if (!usesInputDeduction) {
      if (form.getValues("inputProductId") || form.getValues("inputProductName") || form.getValues("inputQty") || form.getValues("inputUnit") || form.getValues("inputUnitPrice")) {
        form.setValue("inputProductId", "", { shouldDirty: true });
        form.setValue("inputProductName", "", { shouldDirty: true });
        form.setValue("inputQty", 0, { shouldDirty: true });
        form.setValue("inputUnit", "", { shouldDirty: true });
        form.setValue("inputUnitPrice", 0, { shouldDirty: true });
      }
      return;
    }

    const amount = computeSupplierInputDeductionAmount(inputQty, inputUnitPrice);
    if (Math.abs(Number(form.getValues("amount") || 0) - amount) > 0.001) {
      form.setValue("amount", amount, { shouldDirty: true, shouldValidate: true });
    }
  }, [form, inputQty, inputUnitPrice, usesInputDeduction]);

  const applyMoneyType = (type: SupplierDeductionMoneyType) => {
    form.setValue("type", type, { shouldDirty: true, shouldValidate: true });
    form.setValue("amount", 0, { shouldDirty: true, shouldValidate: true });
  };

  const applyInputType = (type: SupplierDeductionInputType) => {
    form.setValue("type", type, { shouldDirty: true, shouldValidate: true });
    form.setValue("amount", 0, { shouldDirty: true, shouldValidate: true });
    form.setValue("inputProductId", "", { shouldDirty: true, shouldValidate: true });
    form.setValue("inputProductName", "", { shouldDirty: true });
    form.setValue("inputQty", 0, { shouldDirty: true, shouldValidate: true });
    form.setValue("inputUnit", getSupplierDeductionInputFieldConfig(type).defaultUnit, { shouldDirty: true, shouldValidate: true });
    form.setValue("inputUnitPrice", 0, { shouldDirty: true, shouldValidate: true });
  };

  const applyDeductionType = (type: SupplierDeductionType) => {
    if (isSupplierInputDeductionType(type)) {
      applyInputType(type);
      return;
    }

    applyMoneyType(type as SupplierDeductionMoneyType);
  };

  const applyInputProduct = (productId: string) => {
    const product = selectableInputProducts.find((item) => item.id === productId);
    const defaultUnit = isSupplierInputDeductionType(selectedType)
      ? getSupplierDeductionInputFieldConfig(selectedType).defaultUnit
      : "";
    form.setValue("inputProductId", productId, { shouldDirty: true, shouldValidate: true });
    form.setValue("inputProductName", product?.name ?? "", { shouldDirty: true });
    form.setValue("inputUnit", defaultUnit || product?.unit || "", { shouldDirty: true });
    form.setValue("inputUnitPrice", product ? product.finalPrice ?? product.price : 0, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <>
      {showSupplierSelect ? (
        <div className="space-y-2">
          <Label>Supplier</Label>
          <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("supplierId")}>
            <option value="">Select supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
            ))}
          </select>
          {form.formState.errors.supplierId ? <p className="text-sm text-destructive">{form.formState.errors.supplierId.message}</p> : null}
        </div>
      ) : (
        <input type="hidden" {...form.register("supplierId")} />
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Deduction type</Label>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={selectedType}
            onChange={(event) => applyDeductionType(event.target.value as SupplierDeductionType)}
          >
            {SUPPLIER_DEDUCTION_TYPES.map((type) => (
              <option key={type} value={type}>{SUPPLIER_DEDUCTION_TYPE_LABELS[type]}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Date</Label>
          <Input type="date" {...form.register("date")} />
        </div>
      </div>
      {usesInputDeduction ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Product</Label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={selectedProductId}
              onChange={(event) => applyInputProduct(event.target.value)}
            >
              <option value="">Select product</option>
              {selectableInputProducts.map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
            {form.formState.errors.inputProductId ? <p className="text-sm text-destructive">{form.formState.errors.inputProductId.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>{inputFieldConfig?.unitLabel ?? "Unit"}</Label>
            <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("inputUnit")}>
              {unitOptions.map((unit) => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
            {form.formState.errors.inputUnit ? <p className="text-sm text-destructive">{form.formState.errors.inputUnit.message}</p> : null}
          </div>
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {usesInputDeduction ? (
          <>
            <div className="space-y-2">
              <Label>{inputFieldConfig?.measureLabel ?? "Quantity"}</Label>
              <Input type="number" step="0.01" {...form.register("inputQty")} />
              {form.formState.errors.inputQty ? <p className="text-sm text-destructive">{form.formState.errors.inputQty.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label>{inputFieldConfig?.unitPriceLabel ?? "Unit price"}</Label>
              <Input type="number" step="0.01" {...form.register("inputUnitPrice")} />
              {form.formState.errors.inputUnitPrice ? <p className="text-sm text-destructive">{form.formState.errors.inputUnitPrice.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label>{inputFieldConfig?.calculatedAmountLabel ?? "Calculated amount"}</Label>
              <div className="flex h-9 items-center rounded-md border bg-muted/30 px-3 text-sm font-semibold text-red-700">
                {formatCurrency(selectedAmount)}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input type="number" step="0.01" {...form.register("amount")} />
            {form.formState.errors.amount ? <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p> : null}
          </div>
        )}
        <div className="space-y-2">
          <Label>Status</Label>
          <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("status")}>
            <option value="open">Open</option>
            <option value="settled">Settled</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Remarks</Label>
        <Textarea {...form.register("remarks")} />
      </div>
    </>
  );
}
