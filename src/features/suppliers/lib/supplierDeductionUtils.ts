import type { Product } from "@/features/products/types/product.types";
import type { SupplierDeductionFormValues, SupplierDeductionInputType, SupplierDeductionType } from "@/features/suppliers/types/supplier-deduction.types";
import { SUPPLIER_DEDUCTION_INPUT_TYPES } from "@/lib/constants";
import { roundNumber } from "@/lib/utils";
import type { FirestoreDoc } from "@/types/global.types";

export const isSupplierInputDeductionType = (type: SupplierDeductionType): type is SupplierDeductionInputType =>
  (SUPPLIER_DEDUCTION_INPUT_TYPES as readonly string[]).includes(type);

export const computeSupplierInputDeductionAmount = (qty: number, unitPrice: number): number =>
  roundNumber(Math.max(0, qty) * Math.max(0, unitPrice));

export const buildSupplierDeductionPayload = (
  values: SupplierDeductionFormValues,
  product?: FirestoreDoc<Product> | null,
): SupplierDeductionFormValues => {
  if (!isSupplierInputDeductionType(values.type)) {
    return {
      ...values,
      amount: roundNumber(values.amount),
      inputProductId: "",
      inputProductName: "",
      inputQty: 0,
      inputUnit: "",
      inputUnitPrice: 0,
    };
  }

  const inputQty = Math.max(0, Number(values.inputQty) || 0);
  const inputUnitPrice = Math.max(0, Number(values.inputUnitPrice) || 0);

  return {
    ...values,
    amount: computeSupplierInputDeductionAmount(inputQty, inputUnitPrice),
    inputProductId: values.inputProductId,
    inputProductName: product?.name ?? values.inputProductName,
    inputQty,
    inputUnit: values.inputUnit || product?.unit || "",
    inputUnitPrice,
  };
};
