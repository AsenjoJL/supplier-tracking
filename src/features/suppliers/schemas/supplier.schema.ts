import { z } from "zod";
import { SUPPLIER_KINDS } from "@/lib/constants";

export const supplierSchema = z.object({
  name: z.string().min(2, "Supplier name is required"),
  supplierKind: z.enum(SUPPLIER_KINDS),
  contactPerson: z.string(),
  phone: z.string(),
  email: z.string().email("Enter a valid email").or(z.literal("")),
  address: z.string(),
  status: z.enum(["active", "inactive"]),
});

export type SupplierSchema = z.infer<typeof supplierSchema>;
