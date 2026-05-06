import type { CreatedAt, EntityStatus } from "@/types/global.types";
import type { SUPPLIER_KINDS } from "@/lib/constants";

export type SupplierKind = (typeof SUPPLIER_KINDS)[number];

export type Supplier = {
  name: string;
  supplierKind?: SupplierKind;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  status: EntityStatus;
  createdAt: CreatedAt;
};

export type SupplierFormValues = Omit<Supplier, "createdAt" | "supplierKind"> & {
  supplierKind: SupplierKind;
};
