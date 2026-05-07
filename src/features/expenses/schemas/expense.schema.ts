import { z } from "zod";
import { EXPENSE_CATEGORIES } from "@/lib/constants";

export const manualExpenseSchema = z.object({
  date: z.string().min(1, "Date is required"),
  category: z.enum(EXPENSE_CATEGORIES),
  description: z.string().min(1, "Item name is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than zero"),
  cropId: z.string(),
  remarks: z.string(),
});
