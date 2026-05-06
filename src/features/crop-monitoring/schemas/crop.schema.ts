import { z } from "zod";
import { CROP_QUANTITY_UNITS, CROP_STATUSES } from "@/lib/constants";

export const cropSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  name: z.string().min(2, "Crop name is required"),
  plantingDate: z.string().min(1, "Planting date is required"),
  daysToHarvest: z.coerce.number().int().positive("Days to harvest must be greater than zero"),
  actualHarvest: z.string().nullable(),
  qty: z.coerce.number().min(0, "Quantity must be positive"),
  qtyUnit: z.enum(CROP_QUANTITY_UNITS),
  status: z.enum(CROP_STATUSES),
  remarks: z.string(),
});

export type CropSchema = z.infer<typeof cropSchema>;
