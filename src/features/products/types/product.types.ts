import type { PRODUCT_TYPES } from "@/lib/constants";
import type { CreatedAt, EntityStatus } from "@/types/global.types";

export type ProductType = (typeof PRODUCT_TYPES)[number];

export type Product = {
  name: string;
  type: ProductType;
  supplierId: string;
  unit: string;
  price: number;
  tarhaPercent?: number;
  deductionAmount?: number;
  finalPrice?: number;
  status: EntityStatus;
  createdAt: CreatedAt;
};

export type ProductFormValues = Omit<Product, "createdAt" | "tarhaPercent" | "deductionAmount" | "finalPrice"> & {
  tarhaPercent: number;
  deductionAmount: number;
  finalPrice: number;
};
