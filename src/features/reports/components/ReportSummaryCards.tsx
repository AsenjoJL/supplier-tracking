import { ArrowDownToLine, ArrowUpFromLine, Scale, Sprout } from "lucide-react";
import { MetricCard } from "@/features/dashboard/components/MetricCard";
import { formatCurrency } from "@/lib/utils";

type ReportSummaryCardsProps = {
  stockInCount: number;
  stockOutCount: number;
  tarhaDeductions: number;
  activeCrops: number;
};

export function ReportSummaryCards({ stockInCount, stockOutCount, tarhaDeductions, activeCrops }: ReportSummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Stock-in transactions" value={stockInCount} icon={ArrowDownToLine} tone="green" />
      <MetricCard label="Stock-out transactions" value={stockOutCount} icon={ArrowUpFromLine} tone="red" />
      <MetricCard label="Tarha deductions" value={formatCurrency(tarhaDeductions)} icon={Scale} tone="amber" />
      <MetricCard label="Active crops" value={activeCrops} icon={Sprout} tone="green" />
    </div>
  );
}
