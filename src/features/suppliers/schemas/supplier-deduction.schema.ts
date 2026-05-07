import { z } from "zod";
import { getSupplierDeductionInputFieldConfig } from "@/features/suppliers/lib/supplierDeductionUtils";
import type { SupplierDeductionInputType } from "@/features/suppliers/types/supplier-deduction.types";
import { SUPPLIER_DEDUCTION_INPUT_TYPES, SUPPLIER_DEDUCTION_STATUSES, SUPPLIER_DEDUCTION_TYPES } from "@/lib/constants";

const inputDeductionTypes = SUPPLIER_DEDUCTION_INPUT_TYPES as readonly string[];

export const supplierDeductionSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  type: z.enum(SUPPLIER_DEDUCTION_TYPES),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  inputProductId: z.string(),
  inputProductName: z.string(),
  inputQty: z.coerce.number().min(0, "Value cannot be negative"),
  inputUnit: z.string(),
  inputUnitPrice: z.coerce.number().min(0, "Unit price cannot be negative"),
  date: z.string().min(1, "Date is required"),
  status: z.enum(SUPPLIER_DEDUCTION_STATUSES),
  remarks: z.string(),
}).superRefine((values, context) => {
  if (!inputDeductionTypes.includes(values.type)) return;

  const fieldConfig = getSupplierDeductionInputFieldConfig(values.type as SupplierDeductionInputType);

  if (!values.inputProductId) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["inputProductId"],
      message: "Product is required",
    });
  }

  if (values.inputQty <= 0) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["inputQty"],
      message: `${fieldConfig.measureErrorLabel} must be greater than zero`,
    });
  }

  if (!values.inputUnit) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["inputUnit"],
      message: "Unit is required",
    });
  }

  if (values.inputUnitPrice <= 0) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["inputUnitPrice"],
      message: "Unit price must be greater than zero",
    });
  }
});

export type SupplierDeductionSchema = z.infer<typeof supplierDeductionSchema>;
