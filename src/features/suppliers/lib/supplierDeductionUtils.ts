import type { Product } from "@/features/products/types/product.types";
import type { SupplierDeductionFormValues, SupplierDeductionInputType, SupplierDeductionType } from "@/features/suppliers/types/supplier-deduction.types";
import { SUPPLIER_DEDUCTION_INPUT_TYPES } from "@/lib/constants";
import { roundNumber } from "@/lib/utils";
import type { FirestoreDoc } from "@/types/global.types";

type SupplierDeductionInputFieldConfig = {
  measureLabel: string;
  measureErrorLabel: string;
  unitLabel: string;
  unitPriceLabel: string;
  calculatedAmountLabel: string;
  defaultUnit: string;
  detailLabel: string;
};

const supplierDeductionInputFieldConfig: Record<SupplierDeductionInputType, SupplierDeductionInputFieldConfig> = {
  abuno: {
    measureLabel: "Quantity",
    measureErrorLabel: "Quantity",
    unitLabel: "Unit",
    unitPriceLabel: "Price per unit",
    calculatedAmountLabel: "Calculated amount",
    defaultUnit: "Kilo",
    detailLabel: "Qty",
  },
  fertilizer: {
    measureLabel: "No. of sacks",
    measureErrorLabel: "Sack count",
    unitLabel: "Sack size",
    unitPriceLabel: "Price per sack",
    calculatedAmountLabel: "Calculated fertilizer deduction",
    defaultUnit: "Sack",
    detailLabel: "Sacks",
  },
  medicine: {
    measureLabel: "No. of bottles",
    measureErrorLabel: "Bottle count",
    unitLabel: "Bottle size",
    unitPriceLabel: "Price per bottle",
    calculatedAmountLabel: "Calculated medicine deduction",
    defaultUnit: "Bottle",
    detailLabel: "Bottles",
  },
  greenSolution: {
    measureLabel: "No. of bottles",
    measureErrorLabel: "Bottle count",
    unitLabel: "Bottle size",
    unitPriceLabel: "Price per bottle",
    calculatedAmountLabel: "Calculated green solution deduction",
    defaultUnit: "Bottle",
    detailLabel: "Bottles",
  },
  seeds: {
    measureLabel: "No. of packs",
    measureErrorLabel: "Pack count",
    unitLabel: "Seed unit",
    unitPriceLabel: "Price per pack",
    calculatedAmountLabel: "Calculated seed deduction",
    defaultUnit: "Pack",
    detailLabel: "Packs",
  },
};

export const isSupplierInputDeductionType = (type: SupplierDeductionType): type is SupplierDeductionInputType =>
  (SUPPLIER_DEDUCTION_INPUT_TYPES as readonly string[]).includes(type);

export const computeSupplierInputDeductionAmount = (qty: number, unitPrice: number): number =>
  roundNumber(Math.max(0, qty) * Math.max(0, unitPrice));

export const getSupplierDeductionInputFieldConfig = (type: SupplierDeductionInputType): SupplierDeductionInputFieldConfig =>
  supplierDeductionInputFieldConfig[type];

export const formatSupplierInputDeductionDetail = (type: SupplierDeductionInputType, qty: number, unit: string, unitPrice: number): string => {
  const config = getSupplierDeductionInputFieldConfig(type);
  return `${config.detailLabel}: ${roundNumber(qty)} ${unit || config.defaultUnit} x ${new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(unitPrice)}`;
};

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
