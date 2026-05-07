import { z } from "zod";
import { SUPPLIER_DEDUCTION_STATUSES, SUPPLIER_DEDUCTION_TYPES } from "@/lib/constants";

export const supplierDeductionSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  type: z.enum(SUPPLIER_DEDUCTION_TYPES),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  date: z.string().min(1, "Date is required"),
  status: z.enum(SUPPLIER_DEDUCTION_STATUSES),
  remarks: z.string(),
});

export type SupplierDeductionSchema = z.infer<typeof supplierDeductionSchema>;
