import { useMemo } from "react";
import { differenceInCalendarDays, eachDayOfInterval, endOfMonth, format, isValid, parseISO, startOfMonth, subDays } from "date-fns";
import { useCrops } from "@/features/crop-monitoring/hooks/useCrops";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useStockIn } from "@/features/stock-in/hooks/useStockIn";
import { useStockOut } from "@/features/stock-out/hooks/useStockOut";
import { useSupplierDeductions } from "@/features/suppliers/hooks/useSupplierDeductions";
import { useSuppliers } from "@/features/suppliers/hooks/useSuppliers";
import {
  CROP_STATUS_LABELS,
  CROP_STATUSES,
  LOW_STOCK_THRESHOLD,
  PRODUCT_TYPE_LABELS,
  PRODUCT_TYPES,
  SUPPLIER_DEDUCTION_TYPE_LABELS,
  SUPPLIER_DEDUCTION_TYPES,
  TARHA_REASON_LABELS,
  TARHA_REASONS,
} from "@/lib/constants";
import { computeNetStockInQty, computeStockBalance, computeStockInPricing } from "@/lib/utils";

const toISODate = (date: Date): string => format(date, "yyyy-MM-dd");

const isWithinRange = (date: string, from: string, to: string): boolean => date >= from && date <= to;

export type ReportDateRange = {
  from: string;
  to: string;
};

const getDefaultReportDateRange = (): ReportDateRange => {
  const now = new Date();
  return {
    from: toISODate(startOfMonth(now)),
    to: toISODate(endOfMonth(now)),
  };
};

const parseDateOrNull = (value: string): Date | null => {
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : null;
};

const normalizeReportDateRange = (range?: ReportDateRange) => {
  const fallback = getDefaultReportDateRange();
  const fromDate = parseDateOrNull(range?.from ?? fallback.from) ?? parseISO(fallback.from);
  const toDate = parseDateOrNull(range?.to ?? fallback.to) ?? parseISO(fallback.to);
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

const getTrendPercent = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
};

export function useReports(dateRange?: ReportDateRange) {
  const products = useProducts();
  const suppliers = useSuppliers();
  const supplierDeductions = useSupplierDeductions();
  const stockIns = useStockIn();
  const stockOuts = useStockOut();
  const crops = useCrops();

  const data = useMemo(() => {
    const range = normalizeReportDateRange(dateRange);
    const allProducts = products.data ?? [];
    const allSuppliers = suppliers.data ?? [];
    const allSupplierDeductions = supplierDeductions.data ?? [];
    const allStockIns = stockIns.data ?? [];
    const allStockOuts = stockOuts.data ?? [];
    const harvestRows = (crops.data ?? []).filter((crop) => {
      const actualHarvestInRange = crop.actualHarvest ? isWithinRange(crop.actualHarvest, range.from, range.to) : false;
      return (
        isWithinRange(crop.plantingDate, range.from, range.to) ||
        isWithinRange(crop.forecastHarvest, range.from, range.to) ||
        actualHarvestInRange ||
        (crop.plantingDate <= range.to && (!crop.actualHarvest || crop.actualHarvest >= range.from))
      );
    });
    const productsById = new Map(allProducts.map((product) => [product.id, product]));
    const suppliersById = new Map(allSuppliers.map((supplier) => [supplier.id, supplier]));
    const stockInsToDate = allStockIns.filter((item) => item.date <= range.to);
    const stockOutsToDate = allStockOuts.filter((item) => item.date <= range.to);
    const periodStockIns = allStockIns.filter((item) => isWithinRange(item.date, range.from, range.to));
    const periodStockOuts = allStockOuts.filter((item) => isWithinRange(item.date, range.from, range.to));
    const periodSupplierDeductions = allSupplierDeductions.filter((item) => isWithinRange(item.date, range.from, range.to));
    const previousSupplierDeductions = allSupplierDeductions.filter((item) => isWithinRange(item.date, range.previousFrom, range.previousTo));
    const periodDays = eachDayOfInterval({ start: range.fromDate, end: range.toDate }).map((date) => ({
      iso: toISODate(date),
      label: format(date, "MMM d"),
    }));
    const getProductUnitValue = (productId: string): number => {
      const product = productsById.get(productId);
      return product?.finalPrice ?? product?.price ?? 0;
    };
    const getStockInValue = (item: (typeof allStockIns)[number]): number =>
      item.finalPrice ?? computeStockInPricing(item.qty, item.originalPrice, item.tarhaQty).finalPrice;
    const getTarhaValue = (item: (typeof allStockIns)[number]): number =>
      item.deductionAmount ?? computeStockInPricing(item.qty, item.originalPrice, item.tarhaQty).deductionAmount;
    const getStockOutValue = (item: (typeof allStockOuts)[number]): number =>
      item.qty * getProductUnitValue(item.productId);
    const inventoryValueAt = (date: string): number =>
      allProducts.reduce((sum, product) => {
        const totalIn = allStockIns
          .filter((item) => item.productId === product.id && item.date <= date)
          .reduce((innerSum, item) => innerSum + computeNetStockInQty(item.qty, item.tarhaQty), 0);
        const totalOut = allStockOuts
          .filter((item) => item.productId === product.id && item.date <= date)
          .reduce((innerSum, item) => innerSum + item.qty, 0);
        const stock = Math.max(0, totalIn - totalOut);
        return sum + stock * (product.finalPrice ?? product.price);
      }, 0);

    const stockRows = allProducts.map((product) => {
      const totalIn = periodStockIns.filter((item) => item.productId === product.id).reduce((sum, item) => sum + computeNetStockInQty(item.qty, item.tarhaQty), 0);
      const totalOut = periodStockOuts.filter((item) => item.productId === product.id).reduce((sum, item) => sum + item.qty, 0);
      const currentStock = computeStockBalance(product.id, stockInsToDate, stockOutsToDate);
      return {
        product,
        supplier: allSuppliers.find((supplier) => supplier.id === product.supplierId) ?? null,
        totalIn,
        totalOut,
        currentStock,
        inventoryValue: Math.max(0, currentStock) * (product.finalPrice ?? product.price),
        movementUnits: totalIn + totalOut,
      };
    });

    const tarhaRows = allStockIns.filter((item) => item.tarhaQty > 0 && isWithinRange(item.date, range.from, range.to));
    const currentStockInValue = periodStockIns.reduce((sum, item) => sum + getStockInValue(item), 0);
    const previousStockInValue = allStockIns
      .filter((item) => isWithinRange(item.date, range.previousFrom, range.previousTo))
      .reduce((sum, item) => sum + getStockInValue(item), 0);
    const currentStockOutValue = periodStockOuts.reduce((sum, item) => sum + getStockOutValue(item), 0);
    const previousStockOutValue = allStockOuts
      .filter((item) => isWithinRange(item.date, range.previousFrom, range.previousTo))
      .reduce((sum, item) => sum + getStockOutValue(item), 0);
    const currentTarhaDeductions = tarhaRows.reduce((sum, item) => sum + getTarhaValue(item), 0);
    const previousTarhaDeductions = allStockIns
      .filter((item) => item.tarhaQty > 0 && isWithinRange(item.date, range.previousFrom, range.previousTo))
      .reduce((sum, item) => sum + getTarhaValue(item), 0);
    const currentSupplierDeductions = periodSupplierDeductions.reduce((sum, item) => sum + item.amount, 0);
    const previousSupplierDeductionsValue = previousSupplierDeductions.reduce((sum, item) => sum + item.amount, 0);
    const totalInventoryValue = stockRows.reduce((sum, row) => sum + row.inventoryValue, 0);
    const previousInventoryValue = inventoryValueAt(range.previousTo);

    const inventoryValueOverTime = periodDays.map((day) => ({
      label: day.label,
      value: inventoryValueAt(day.iso),
    }));
    const stockMovementOverTime = periodDays.map((day) => ({
      label: day.label,
      stockIn: allStockIns.filter((item) => item.date === day.iso).reduce((sum, item) => sum + getStockInValue(item), 0),
      stockOut: allStockOuts.filter((item) => item.date === day.iso).reduce((sum, item) => sum + getStockOutValue(item), 0),
    }));
    const inventoryByProduct = stockRows
      .filter((row) => row.currentStock !== 0 || row.totalIn > 0 || row.totalOut > 0)
      .sort((left, right) => right.currentStock - left.currentStock)
      .slice(0, 8)
      .map((row) => ({
        label: row.product.name,
        value: row.currentStock,
        detail: `${row.totalIn} in / ${row.totalOut} out`,
      }));
    const inventoryByCategory = PRODUCT_TYPES.map((type) => {
      const rowsByType = stockRows.filter((row) => row.product.type === type);
      return {
        label: PRODUCT_TYPE_LABELS[type],
        value: rowsByType.reduce((sum, row) => sum + row.inventoryValue, 0),
        detail: `${rowsByType.length} ${rowsByType.length === 1 ? "product" : "products"}`,
      };
    }).filter((row) => row.value > 0);
    const stockMovementByType = PRODUCT_TYPES.map((type) => {
      const rowsByType = stockRows.filter((row) => row.product.type === type);
      return {
        label: PRODUCT_TYPE_LABELS[type],
        stockIn: rowsByType.reduce((sum, row) => sum + row.totalIn, 0),
        stockOut: rowsByType.reduce((sum, row) => sum + row.totalOut, 0),
      };
    }).filter((row) => row.stockIn > 0 || row.stockOut > 0);
    const topFastMovingItems = stockRows
      .filter((row) => row.movementUnits > 0)
      .sort((left, right) => right.movementUnits - left.movementUnits)
      .slice(0, 5)
      .map((row) => ({
        label: row.product.name,
        value: row.movementUnits,
        detail: `${row.movementUnits} ${row.product.unit}`,
      }));
    const tarhaByReason = TARHA_REASONS.map((reason) => {
      const rowsByReason = tarhaRows.filter((row) => row.tarhaReason === reason);
      return {
        label: TARHA_REASON_LABELS[reason],
        value: rowsByReason.reduce((sum, row) => sum + getTarhaValue(row), 0),
        detail: `${rowsByReason.length} ${rowsByReason.length === 1 ? "record" : "records"}`,
      };
    }).filter((row) => row.value > 0);
    const supplierDeductionsByType = SUPPLIER_DEDUCTION_TYPES.map((type) => {
      const rowsByType = periodSupplierDeductions.filter((row) => row.type === type);
      return {
        label: SUPPLIER_DEDUCTION_TYPE_LABELS[type],
        value: rowsByType.reduce((sum, row) => sum + row.amount, 0),
        detail: `${rowsByType.length} ${rowsByType.length === 1 ? "record" : "records"}`,
      };
    }).filter((row) => row.value > 0);
    const cropStatus = CROP_STATUSES.map((status) => {
      const count = harvestRows.filter((crop) => crop.status === status).length;
      return {
        label: CROP_STATUS_LABELS[status],
        value: count,
      };
    }).filter((row) => row.value > 0);
    const supplierDeductionRows = periodSupplierDeductions
      .map((deduction) => ({
        deduction,
        supplier: suppliersById.get(deduction.supplierId) ?? null,
      }))
      .sort((left, right) => right.deduction.date.localeCompare(left.deduction.date));

    return {
      stockRows,
      lowItems: stockRows.filter((row) => row.currentStock <= LOW_STOCK_THRESHOLD),
      tarhaRows,
      supplierDeductionRows,
      harvestRows,
      analytics: {
        periodLabel: `${format(range.fromDate, "MMM d")} - ${format(range.toDate, "MMM d, yyyy")}`,
        inventoryValueOverTime,
        stockMovementOverTime,
        inventoryByCategory,
        inventoryByProduct,
        stockMovementByType,
        topFastMovingItems,
        tarhaByReason,
        supplierDeductionsByType,
        cropStatus,
        monthlySummary: {
          inventoryTrend: getTrendPercent(totalInventoryValue, previousInventoryValue),
          stockInTrend: getTrendPercent(currentStockInValue, previousStockInValue),
          stockOutTrend: getTrendPercent(currentStockOutValue, previousStockOutValue),
          tarhaTrend: getTrendPercent(currentTarhaDeductions, previousTarhaDeductions),
          supplierDeductionTrend: getTrendPercent(currentSupplierDeductions, previousSupplierDeductionsValue),
          lowItemCount: stockRows.filter((row) => row.currentStock <= LOW_STOCK_THRESHOLD).length,
        },
      },
      summary: {
        totalInventoryValue,
        totalStockInValue: currentStockInValue,
        totalStockOutValue: currentStockOutValue,
        tarhaDeductions: currentTarhaDeductions,
        supplierDeductions: currentSupplierDeductions,
        stockInCount: allStockIns.length,
        stockOutCount: allStockOuts.length,
        activeCrops: harvestRows.filter((crop) => !["harvested", "failed"].includes(crop.status)).length,
        trends: {
          inventory: getTrendPercent(totalInventoryValue, previousInventoryValue),
          stockIn: getTrendPercent(currentStockInValue, previousStockInValue),
          stockOut: getTrendPercent(currentStockOutValue, previousStockOutValue),
          tarha: getTrendPercent(currentTarhaDeductions, previousTarhaDeductions),
          supplierDeductions: getTrendPercent(currentSupplierDeductions, previousSupplierDeductionsValue),
        },
      },
    };
  }, [crops.data, dateRange?.from, dateRange?.to, products.data, stockIns.data, stockOuts.data, supplierDeductions.data, suppliers.data]);

  return {
    ...data,
    products: products.data ?? [],
    suppliers: suppliers.data ?? [],
    stockIns: stockIns.data ?? [],
    stockOuts: stockOuts.data ?? [],
    isLoading: products.isLoading || suppliers.isLoading || supplierDeductions.isLoading || stockIns.isLoading || stockOuts.isLoading || crops.isLoading,
  };
}
