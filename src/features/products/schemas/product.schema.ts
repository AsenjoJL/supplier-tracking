import { z } from "zod";
import { PRODUCT_TYPES } from "@/lib/constants";

export const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  type: z.enum(PRODUCT_TYPES),
  supplierId: z.string(),
  unit: z.string().min(1, "Unit is required"),
  price: z.coerce.number().min(0, "Price must be positive"),
  tarhaPercent: z.coerce.number().int().min(0, "Tarha percent cannot be negative").max(20, "Tarha percent cannot exceed 20%"),
  deductionAmount: z.coerce.number().min(0, "Deduction amount cannot be negative"),
  finalPrice: z.coerce.number().min(0, "Final price cannot be negative"),
  status: z.enum(["active", "inactive"]),
});

export type ProductSchema = z.infer<typeof productSchema>;
