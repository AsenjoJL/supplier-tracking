import type { TARHA_REASONS } from "@/lib/constants";
import type { CreatedAt } from "@/types/global.types";

export type TarhaReason = (typeof TARHA_REASONS)[number];

export type StockIn = {
  supplierId: string;
  productId: string;
  qty: number;
  unit: string;
  originalPrice: number;
  tarhaPercent?: number;
  tarhaQty: number;
  deductionAmount?: number;
  tarhaReason: TarhaReason | null;
  finalPrice: number;
  purpose: string;
  date: string;
  remarks: string;
  createdAt: CreatedAt;
};

export type StockInFormValues = Omit<StockIn, "createdAt" | "finalPrice" | "tarhaPercent" | "deductionAmount"> & {
  tarhaPercent: number;
  deductionAmount: number;
};
