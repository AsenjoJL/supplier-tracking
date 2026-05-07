import type { EXPENSE_CATEGORIES, EXPENSE_SOURCES } from "@/lib/constants";
import type { CreatedAt } from "@/types/global.types";

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type ExpenseSource = (typeof EXPENSE_SOURCES)[number];

export type ManualExpense = {
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  cropId: string;
  remarks: string;
  createdAt: CreatedAt;
};

export type ManualExpenseFormValues = Omit<ManualExpense, "createdAt">;

export type ExpenseRow = {
  id: string;
  date: string;
  source: ExpenseSource;
  category: ExpenseCategory;
  itemName: string;
  cropId: string;
  cropName: string;
  qtyLabel: string;
  unitPrice: number;
  amount: number;
  supplierOrRemarks: string;
  manualExpenseId?: string;
};
