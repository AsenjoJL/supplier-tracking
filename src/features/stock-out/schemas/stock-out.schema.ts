import { z } from "zod";
import { STOCK_OUT_PURPOSES } from "@/lib/constants";

export const stockOutSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  qty: z.coerce.number().positive("Quantity must be greater than zero"),
  unit: z.string().min(1, "Unit is required"),
  purpose: z.enum(STOCK_OUT_PURPOSES),
  cropId: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  remarks: z.string(),
});

export type StockOutSchema = z.infer<typeof stockOutSchema>;
