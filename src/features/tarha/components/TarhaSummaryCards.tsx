import { ClipboardList, Scale } from "lucide-react";
import { MetricCard } from "@/features/dashboard/components/MetricCard";
import { formatCurrency } from "@/lib/utils";

type TarhaSummaryCardsProps = {
  recordCount: number;
  totalDeductions: number;
};

export function TarhaSummaryCards({ recordCount, totalDeductions }: TarhaSummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <MetricCard label="Tarha records" value={recordCount} icon={ClipboardList} tone="amber" />
      <MetricCard label="Total deduction amount" value={formatCurrency(totalDeductions)} icon={Scale} tone="red" />
    </div>
  );
}
