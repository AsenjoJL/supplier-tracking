export const queryKeys = {
  auth: {
    user: ["auth", "user"] as const,
  },
  suppliers: {
    all: ["suppliers"] as const,
    lists: () => [...queryKeys.suppliers.all, "list"] as const,
    detail: (id: string) => [...queryKeys.suppliers.all, "detail", id] as const,
  },
  supplierDeductions: {
    all: ["supplier-deductions"] as const,
    lists: () => [...queryKeys.supplierDeductions.all, "list"] as const,
  },
  products: {
    all: ["products"] as const,
    lists: () => [...queryKeys.products.all, "list"] as const,
  },
  stockIn: {
    all: ["stock-in"] as const,
    lists: () => [...queryKeys.stockIn.all, "list"] as const,
  },
  stockOut: {
    all: ["stock-out"] as const,
    lists: () => [...queryKeys.stockOut.all, "list"] as const,
  },
  crops: {
    all: ["crops"] as const,
    lists: () => [...queryKeys.crops.all, "list"] as const,
  },
  expenses: {
    all: ["expenses"] as const,
    lists: () => [...queryKeys.expenses.all, "list"] as const,
  },
  dashboard: {
    metrics: ["dashboard", "metrics"] as const,
  },
  reports: {
    all: ["reports"] as const,
  },
};
