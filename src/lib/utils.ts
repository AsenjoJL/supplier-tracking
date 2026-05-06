import { type ClassValue, clsx } from "clsx";
import { format, parseISO } from "date-fns";
import { twMerge } from "tailwind-merge";
import type { FirestoreDoc } from "@/types/global.types";

type StockInLike = {
  productId: string;
  qty: number;
};

type StockOutLike = {
  productId: string;
  qty: number;
};

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

export const formatDate = (date?: string | Date | null): string => {
  if (!date) return "—";
  const parsed = typeof date === "string" ? parseISO(date) : date;
  return Number.isNaN(parsed.getTime()) ? "—" : format(parsed, "MMM d, yyyy");
};

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(value);

export const computeStockBalance = <TIn extends StockInLike, TOut extends StockOutLike>(
  productId: string,
  stockIns: FirestoreDoc<TIn>[],
  stockOuts: FirestoreDoc<TOut>[],
): number => {
  const totalIn = stockIns
    .filter((item) => item.productId === productId)
    .reduce((sum, item) => sum + item.qty, 0);
  const totalOut = stockOuts
    .filter((item) => item.productId === productId)
    .reduce((sum, item) => sum + item.qty, 0);
  return totalIn - totalOut;
};

export const computeTarhaPricing = (originalPrice: number, tarhaPercent: number) => {
  const deductionAmount = Number((originalPrice * (tarhaPercent / 100)).toFixed(2));
  const finalPrice = Number(Math.max(0, originalPrice - deductionAmount).toFixed(2));

  return { deductionAmount, finalPrice };
};

export const addDaysToISODate = (isoDate: string, days: number): string => {
  const date = parseISO(isoDate);
  date.setDate(date.getDate() + days);
  return format(date, "yyyy-MM-dd");
};

export const todayISO = (): string => format(new Date(), "yyyy-MM-dd");

export const daysBetween = (fromIso: string, toIso: string): number => {
  const from = parseISO(fromIso).getTime();
  const to = parseISO(toIso).getTime();
  return Math.ceil((to - from) / 86_400_000);
};

export const normalizeSearch = (value: string): string => value.trim().toLowerCase();
