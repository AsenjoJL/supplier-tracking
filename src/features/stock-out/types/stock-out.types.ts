import type { STOCK_OUT_PURPOSES } from "@/lib/constants";
import type { CreatedAt } from "@/types/global.types";

export type StockOutPurpose = (typeof STOCK_OUT_PURPOSES)[number];

export type StockOut = {
  productId: string;
  qty: number;
  unit: string;
  purpose: StockOutPurpose;
  cropId?: string;
  date: string;
  remarks: string;
  createdAt: CreatedAt;
};

export type StockOutFormValues = Omit<StockOut, "createdAt">;
