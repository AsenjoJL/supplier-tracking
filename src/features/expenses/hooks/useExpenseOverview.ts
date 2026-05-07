import { useMemo } from "react";
import { differenceInCalendarDays, eachDayOfInterval, format, isValid, parseISO, subDays } from "date-fns";
import { useCrops } from "@/features/crop-monitoring/hooks/useCrops";
import { useManualExpenses } from "@/features/expenses/hooks/useManualExpenses";
import type { ExpenseCategory, ExpenseRow, ExpenseSource } from "@/features/expenses/types/expense.types";
import { useProducts } from "@/features/products/hooks/useProducts";
import type { ProductType } from "@/features/products/types/product.types";
import { useStockIn } from "@/features/stock-in/hooks/useStockIn";
import { useStockOut } from "@/features/stock-out/hooks/useStockOut";
import { useSupplierDeductions } from "@/features/suppliers/hooks/useSupplierDeductions";
import { isSupplierInputDeductionType } from "@/features/suppliers/lib/supplierDeductionUtils";
import { useSuppliers } from "@/features/suppliers/hooks/useSuppliers";
import { EXPENSE_CATEGORY_LABELS, EXPENSE_CATEGORIES, EXPENSE_SOURCE_LABELS, EXPENSE_SOURCES, SUPPLIER_DEDUCTION_TYPE_LABELS } from "@/lib/constants";
import { computeStockInPricing, roundNumber } from "@/lib/utils";
import type { SupplierDeductionType } from "@/features/suppliers/types/supplier-deduction.types";

export type ExpenseDateRange = {
  from: string;
  to: string;
};

const toISODate = (date: Date): string => format(date, "yyyy-MM-dd");

const parseDateOrNull = (value: string): Date | null => {
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : null;
};

const normalizeDateRange = (range: ExpenseDateRange) => {
  const fallback = new Date();
  const fromDate = parseDateOrNull(range.from) ?? fallback;
  const toDate = parseDateOrNull(range.to) ?? fallback;
  const start = fromDate <= toDate ? fromDate : toDate;
  const end = fromDate <= toDate ? toDate : fromDate;
  const dayCount = Math.max(1, differenceInCalendarDays(end, start) + 1);
  const previousEnd = subDays(start, 1);
  const previousStart = subDays(previousEnd, dayCount - 1);

  return {
    from: toISODate(start),
    to: toISODate(end),
    fromDate: start,
    toDate: end,
    previousFrom: toISODate(previousStart),
    previousTo: toISODate(previousEnd),
  };
};

const isWithinRange = (date: string, from: string, to: string): boolean => date >= from && date <= to;

const trendPercent = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
};

const productTypeToExpenseCategory = (type: ProductType): ExpenseCategory => {
  if (type === "abuno") return "abuno";
  if (type === "fertilizer" || type === "medicine" || type === "greenSolution" || type === "seeds") return type;
  return "others";
};

const supplierDeductionTypeToExpenseCategory = (type: SupplierDeductionType): ExpenseCategory => {
  if (type === "abuno" || type === "fertilizer" || type === "medicine" || type === "greenSolution" || type === "seeds") return type;
  if (type === "cashAdvance" || type === "loan" || type === "packaging" || type === "others") return type;
  if (type === "transport") return "transportation";
  return "others";
};

export function useExpenseOverview(range: ExpenseDateRange) {
  const manualExpenses = useManualExpenses();
  const products = useProducts();
  const suppliers = useSuppliers();
  const supplierDeductions = useSupplierDeductions();
  const crops = useCrops();
  const stockIns = useStockIn();
  const stockOuts = useStockOut();

  const data = useMemo(() => {
    const normalized = normalizeDateRange(range);
    const productMap = new Map((products.data ?? []).map((product) => [product.id, product]));
    const cropMap = new Map((crops.data ?? []).map((crop) => [crop.id, crop]));
    const supplierMap = new Map((suppliers.data ?? []).map((supplier) => [supplier.id, supplier]));
    const unitPriceForProduct = (productId: string): number => {
      const product = productMap.get(productId);
      return product?.finalPrice ?? product?.price ?? 0;
    };
    const allSupplierDeductions = supplierDeductions.data ?? [];
    const sourceRows: ExpenseRow[] = [
      ...(stockIns.data ?? []).map((stockIn): ExpenseRow => {
        const product = productMap.get(stockIn.productId);
        const supplier = supplierMap.get(stockIn.supplierId);
        return {
          id: `stockIn-${stockIn.id}`,
          date: stockIn.date,
          source: "stockIn",
          category: product ? productTypeToExpenseCategory(product.type) : "others",
          itemName: product?.name ?? "Unknown product",
          cropId: "",
          cropName: "—",
          qtyLabel: `${stockIn.qty} ${stockIn.unit}`,
          unitPrice: stockIn.originalPrice,
          amount: stockIn.finalPrice,
          supplierOrRemarks: supplier?.name ?? stockIn.remarks ?? "Purchase",
        };
      }),
      ...(stockOuts.data ?? [])
        .filter((stockOut) => (stockOut.purpose === "planting" || stockOut.purpose === "cropMaintenance") && Boolean(stockOut.cropId))
        .map((stockOut): ExpenseRow => {
          const product = productMap.get(stockOut.productId);
          const crop = stockOut.cropId ? cropMap.get(stockOut.cropId) : null;
          const unitPrice = unitPriceForProduct(stockOut.productId);
          return {
            id: `cropInput-${stockOut.id}`,
            date: stockOut.date,
            source: "cropInput",
            category: product ? productTypeToExpenseCategory(product.type) : "others",
            itemName: product?.name ?? "Unknown input",
            cropId: stockOut.cropId ?? "",
            cropName: crop?.name ?? "Unassigned crop",
            qtyLabel: `${stockOut.qty} ${stockOut.unit}`,
            unitPrice,
            amount: stockOut.qty * unitPrice,
            supplierOrRemarks: stockOut.remarks || "Used in field",
          };
        }),
      ...(manualExpenses.data ?? []).map((expense): ExpenseRow => ({
        id: `manual-${expense.id}`,
        date: expense.date,
        source: "manual",
        category: expense.category,
        itemName: expense.description,
        cropId: expense.cropId,
        cropName: expense.cropId ? cropMap.get(expense.cropId)?.name ?? "Unknown crop" : "—",
        qtyLabel: "—",
        unitPrice: expense.amount,
        amount: expense.amount,
        supplierOrRemarks: expense.remarks || "Manual expense",
        manualExpenseId: expense.id,
      })),
      ...allSupplierDeductions.map((deduction): ExpenseRow => {
        const supplier = supplierMap.get(deduction.supplierId);
        const isInputDeduction = isSupplierInputDeductionType(deduction.type);
        return {
          id: `supplierDeduction-${deduction.id}`,
          date: deduction.date,
          source: "supplierDeduction",
          category: supplierDeductionTypeToExpenseCategory(deduction.type),
          itemName: isInputDeduction
            ? deduction.inputProductName || SUPPLIER_DEDUCTION_TYPE_LABELS[deduction.type]
            : SUPPLIER_DEDUCTION_TYPE_LABELS[deduction.type],
          cropId: "",
          cropName: "—",
          qtyLabel: isInputDeduction ? `${deduction.inputQty ?? 0} ${deduction.inputUnit || "unit"}` : "—",
          unitPrice: isInputDeduction ? deduction.inputUnitPrice ?? 0 : deduction.amount,
          amount: deduction.amount,
          supplierOrRemarks: [supplier?.name ?? "Unknown supplier", deduction.remarks].filter(Boolean).join(" - "),
        };
      }),
      ...(stockIns.data ?? [])
        .filter((stockIn) => stockIn.tarhaQty > 0)
        .map((stockIn): ExpenseRow => {
          const product = productMap.get(stockIn.productId);
          return {
            id: `tarha-${stockIn.id}`,
            date: stockIn.date,
            source: "tarha",
            category: "others",
            itemName: product ? `Tarha - ${product.name}` : "Tarha loss",
            cropId: "",
            cropName: "—",
            qtyLabel: `${stockIn.tarhaQty} ${stockIn.unit}`,
            unitPrice: stockIn.originalPrice,
            amount: stockIn.deductionAmount ?? computeStockInPricing(stockIn.qty, stockIn.originalPrice, stockIn.tarhaQty).deductionAmount,
            supplierOrRemarks: stockIn.tarhaReason ?? "Quality deduction",
          };
        }),
    ];

    const rows = sourceRows
      .filter((row) => isWithinRange(row.date, normalized.from, normalized.to))
      .sort((left, right) => right.date.localeCompare(left.date));
    const previousRows = sourceRows.filter((row) => isWithinRange(row.date, normalized.previousFrom, normalized.previousTo));
    const periodSupplierDeductions = allSupplierDeductions.filter((deduction) => isWithinRange(deduction.date, normalized.from, normalized.to));
    const totalForSource = (source: ExpenseSource, items = rows): number => items.filter((row) => row.source === source).reduce((sum, row) => sum + row.amount, 0);
    const totalExpenses = rows.reduce((sum, row) => sum + row.amount, 0);
    const previousTotalExpenses = previousRows.reduce((sum, row) => sum + row.amount, 0);
    const days = eachDayOfInterval({ start: normalized.fromDate, end: normalized.toDate }).map((date) => ({
      iso: toISODate(date),
      label: format(date, "MMM d"),
    }));

    const breakdownBySource = EXPENSE_SOURCES.map((source) => ({
      label: EXPENSE_SOURCE_LABELS[source],
      source,
      value: totalForSource(source),
    })).filter((item) => item.value > 0);
    const byCategory = EXPENSE_CATEGORIES.map((category) => ({
      label: EXPENSE_CATEGORY_LABELS[category],
      category,
      value: rows.filter((row) => row.category === category).reduce((sum, row) => sum + row.amount, 0),
    })).filter((item) => item.value > 0);
    const byCrop = Array.from(
      rows
        .filter((row) => row.cropName !== "—")
        .reduce((map, row) => map.set(row.cropName, (map.get(row.cropName) ?? 0) + row.amount), new Map<string, number>()),
    )
      .map(([label, value]) => ({ label, value }))
      .sort((left, right) => right.value - left.value)
      .slice(0, 6);
    const supplierDeductionRows = rows.filter((row) => row.source === "supplierDeduction");
    const supplierDeductionsByType = EXPENSE_CATEGORIES.map((category) => {
      const categoryRows = supplierDeductionRows.filter((row) => row.category === category);
      return {
        label: EXPENSE_CATEGORY_LABELS[category],
        category,
        value: categoryRows.reduce((sum, row) => sum + row.amount, 0),
        detail: `${categoryRows.length} ${categoryRows.length === 1 ? "record" : "records"}`,
      };
    }).filter((item) => item.value > 0);
    const supplierInputDeductionsByProduct = Array.from(
      periodSupplierDeductions
        .filter((deduction) => isSupplierInputDeductionType(deduction.type))
        .reduce((map, deduction) => {
          const key = deduction.inputProductId || deduction.inputProductName || deduction.type;
          const existing = map.get(key) ?? {
            label: deduction.inputProductName || SUPPLIER_DEDUCTION_TYPE_LABELS[deduction.type],
            value: 0,
            quantity: 0,
            unit: deduction.inputUnit || "unit",
            records: 0,
          };
          const deductionUnit = deduction.inputUnit || "unit";
          existing.value += deduction.amount;
          existing.quantity += deduction.inputQty ?? 0;
          existing.records += 1;
          existing.unit = existing.unit === deductionUnit ? existing.unit : "mixed units";
          map.set(key, existing);
          return map;
        }, new Map<string, { label: string; value: number; quantity: number; unit: string; records: number }>())
        .values(),
    )
      .map((row) => ({
        label: row.label,
        value: row.value,
        detail: `${roundNumber(row.quantity)} ${row.unit}, ${row.records} ${row.records === 1 ? "record" : "records"}`,
      }))
      .sort((left, right) => right.value - left.value)
      .slice(0, 6);
    const overTime = days.map((day) => ({
      label: day.label,
      stockIn: rows.filter((row) => row.source === "stockIn" && row.date === day.iso).reduce((sum, row) => sum + row.amount, 0),
      cropInput: rows.filter((row) => row.source === "cropInput" && row.date === day.iso).reduce((sum, row) => sum + row.amount, 0),
      supplierDeduction: rows.filter((row) => row.source === "supplierDeduction" && row.date === day.iso).reduce((sum, row) => sum + row.amount, 0),
      manual: rows.filter((row) => row.source === "manual" && row.date === day.iso).reduce((sum, row) => sum + row.amount, 0),
      tarha: rows.filter((row) => row.source === "tarha" && row.date === day.iso).reduce((sum, row) => sum + row.amount, 0),
    }));

    return {
      rows,
      manualExpenses: manualExpenses.data ?? [],
      crops: crops.data ?? [],
      periodLabel: `${format(normalized.fromDate, "MMM d")} - ${format(normalized.toDate, "MMM d, yyyy")}`,
      summary: {
        totalExpenses,
        stockInPurchases: totalForSource("stockIn"),
        cropInputExpenses: totalForSource("cropInput"),
        supplierDeductions: totalForSource("supplierDeduction"),
        manualExpenses: totalForSource("manual"),
        tarhaLosses: totalForSource("tarha"),
        trends: {
          total: trendPercent(totalExpenses, previousTotalExpenses),
          stockIn: trendPercent(totalForSource("stockIn"), totalForSource("stockIn", previousRows)),
          cropInput: trendPercent(totalForSource("cropInput"), totalForSource("cropInput", previousRows)),
          supplierDeduction: trendPercent(totalForSource("supplierDeduction"), totalForSource("supplierDeduction", previousRows)),
          manual: trendPercent(totalForSource("manual"), totalForSource("manual", previousRows)),
          tarha: trendPercent(totalForSource("tarha"), totalForSource("tarha", previousRows)),
        },
      },
      analytics: {
        breakdownBySource,
        overTime,
        byCategory,
        byCrop,
        supplierDeductionsByType,
        supplierInputDeductionsByProduct,
      },
    };
  }, [crops.data, manualExpenses.data, products.data, range.from, range.to, stockIns.data, stockOuts.data, supplierDeductions.data, suppliers.data]);

  return {
    ...data,
    isLoading: manualExpenses.isLoading || products.isLoading || suppliers.isLoading || supplierDeductions.isLoading || crops.isLoading || stockIns.isLoading || stockOuts.isLoading,
  };
}
