export const LOW_STOCK_THRESHOLD = 5;

export const PRODUCT_TYPES = [
  "vegetable",
  "abuno",
  "fertilizer",
  "medicine",
  "greenSolution",
  "seeds",
  "other",
] as const;

export const FARM_INPUT_TYPES = ["abuno", "fertilizer", "medicine", "greenSolution", "seeds"] as const;

export const UNIT_OPTIONS = ["Kilo", "Gram", "Piece", "Bundle", "Pack", "Sack", "Box", "Tray", "Bottle", "Liter"] as const;

export const CROP_QUANTITY_UNITS = ["pcs", "seedlings", "sachet", "tray", "pack", "kilo", "grams", "bundle", "hectare", "sqm"] as const;

export const SUPPLIER_KINDS = ["vegetable", "farmInput", "both"] as const;

export const EXPENSE_CATEGORIES = [
  "fertilizer",
  "medicine",
  "greenSolution",
  "seeds",
  "labor",
  "transportation",
  "packaging",
  "utilities",
  "maintenance",
  "others",
] as const;

export const EXPENSE_SOURCES = ["stockIn", "cropInput", "manual", "tarha"] as const;

export const STOCK_OUT_PURPOSES = [
  "sold",
  "planting",
  "cropMaintenance",
  "returned",
  "damaged",
  "transferred",
] as const;

export const TARHA_REASONS = [
  "damaged",
  "overripe",
  "smallSize",
  "rotten",
  "notIncluded",
  "others",
] as const;

export const TARHA_PERCENT_OPTIONS = Array.from({ length: 21 }, (_, index) => index);

export const STOCK_IN_PRICE_OPTIONS = Array.from({ length: 30 }, (_, index) => (index + 1) * 5);

export const PRODUCT_TARHA_PERCENT_OPTIONS = Array.from({ length: 21 }, (_, index) => index);

export const CROP_STATUSES = [
  "planted",
  "growing",
  "treated",
  "readyForHarvest",
  "harvested",
  "failed",
] as const;

export const PRODUCT_TYPE_LABELS: Record<(typeof PRODUCT_TYPES)[number], string> = {
  vegetable: "Vegetable",
  abuno: "Abuno",
  fertilizer: "Fertilizer",
  medicine: "Medicine",
  greenSolution: "Green Solution",
  seeds: "Seeds",
  other: "Other",
};

export const SUPPLIER_KIND_LABELS: Record<(typeof SUPPLIER_KINDS)[number], string> = {
  vegetable: "Vegetable Supplier",
  farmInput: "Farm Input Supplier",
  both: "Vegetable + Farm Input",
};

export const EXPENSE_CATEGORY_LABELS: Record<(typeof EXPENSE_CATEGORIES)[number], string> = {
  fertilizer: "Fertilizer",
  medicine: "Medicine",
  greenSolution: "Green Solutions",
  seeds: "Seeds",
  labor: "Labor",
  transportation: "Transportation",
  packaging: "Packaging",
  utilities: "Utilities",
  maintenance: "Maintenance",
  others: "Others",
};

export const EXPENSE_SOURCE_LABELS: Record<(typeof EXPENSE_SOURCES)[number], string> = {
  stockIn: "From Stock In",
  cropInput: "From Vegetables (Crop)",
  manual: "Manual Expenses",
  tarha: "Tarha / Losses",
};

export const STOCK_OUT_PURPOSE_LABELS: Record<(typeof STOCK_OUT_PURPOSES)[number], string> = {
  sold: "Sold",
  planting: "Used for planting",
  cropMaintenance: "Crop maintenance",
  returned: "Returned",
  damaged: "Damaged",
  transferred: "Transferred",
};

export const TARHA_REASON_LABELS: Record<(typeof TARHA_REASONS)[number], string> = {
  damaged: "Damaged",
  overripe: "Overripe",
  smallSize: "Small size",
  rotten: "Rotten",
  notIncluded: "Not included in goods",
  others: "Others",
};

export const CROP_STATUS_LABELS: Record<(typeof CROP_STATUSES)[number], string> = {
  planted: "Planted",
  growing: "Growing",
  treated: "Treated",
  readyForHarvest: "Ready for harvest",
  harvested: "Harvested",
  failed: "Failed/Damaged",
};
