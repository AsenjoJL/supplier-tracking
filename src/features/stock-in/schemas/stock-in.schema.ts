import { z } from "zod";
import { TARHA_REASONS } from "@/lib/constants";

export const stockInSchema = z.object({
  supplierId: z.string(),
  productId: z.string().min(1, "Product is required"),
  qty: z.coerce.number().positive("Quantity must be greater than zero"),
  unit: z.string().min(1, "Unit is required"),
  originalPrice: z.coerce.number().min(0, "Unit price must be positive"),
  tarhaPercent: z.coerce.number().min(0, "Tarha percent cannot be negative").max(100, "Tarha percent cannot exceed 100%"),
  tarhaQty: z.coerce.number().min(0, "Tarha quantity cannot be negative"),
  deductionAmount: z.coerce.number().min(0, "Deduction amount cannot be negative"),
  tarhaReason: z.enum(TARHA_REASONS).nullable(),
  purpose: z.string().min(1, "Purpose is required"),
  date: z.string().min(1, "Date is required"),
  remarks: z.string(),
}).refine((value) => value.tarhaQty <= value.qty, {
  path: ["tarhaQty"],
  message: "Tarha quantity cannot exceed received quantity",
}).refine((value) => value.tarhaQty === 0 || value.tarhaReason !== null, {
  path: ["tarhaReason"],
  message: "Choose a Tarha reason",
});

export type StockInSchema = z.infer<typeof stockInSchema>;
