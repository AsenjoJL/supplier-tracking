import type { SUPPLIER_DEDUCTION_INPUT_TYPES, SUPPLIER_DEDUCTION_MONEY_TYPES, SUPPLIER_DEDUCTION_STATUSES, SUPPLIER_DEDUCTION_TYPES } from "@/lib/constants";
import type { CreatedAt } from "@/types/global.types";

export type SupplierDeductionType = (typeof SUPPLIER_DEDUCTION_TYPES)[number];
export type SupplierDeductionMoneyType = (typeof SUPPLIER_DEDUCTION_MONEY_TYPES)[number];
export type SupplierDeductionInputType = (typeof SUPPLIER_DEDUCTION_INPUT_TYPES)[number];
export type SupplierDeductionStatus = (typeof SUPPLIER_DEDUCTION_STATUSES)[number];

export type SupplierDeduction = {
  supplierId: string;
  type: SupplierDeductionType;
  amount: number;
  inputProductId: string;
  inputProductName: string;
  inputQty: number;
  inputUnit: string;
  inputUnitPrice: number;
  date: string;
  status: SupplierDeductionStatus;
  remarks: string;
  createdAt: CreatedAt;
};

export type SupplierDeductionFormValues = Omit<SupplierDeduction, "createdAt">;
