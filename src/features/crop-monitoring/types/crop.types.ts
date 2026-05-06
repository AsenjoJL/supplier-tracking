import type { CROP_QUANTITY_UNITS, CROP_STATUSES } from "@/lib/constants";
import type { CreatedAt } from "@/types/global.types";

export type CropStatus = (typeof CROP_STATUSES)[number];
export type CropQuantityUnit = (typeof CROP_QUANTITY_UNITS)[number];

export type Crop = {
  supplierId: string;
  name: string;
  plantingDate: string;
  daysToHarvest: number;
  forecastHarvest: string;
  actualHarvest: string | null;
  qty: number;
  qtyUnit?: CropQuantityUnit;
  status: CropStatus;
  remarks: string;
  createdAt: CreatedAt;
};

export type CropFormValues = Omit<Crop, "createdAt" | "forecastHarvest" | "qtyUnit"> & {
  qtyUnit: CropQuantityUnit;
};
