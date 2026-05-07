import { SectionCard } from "@/components/common/SectionCard";
import type { useReports } from "@/features/reports/hooks/useReports";
import { formatCurrency } from "@/lib/utils";

type ReportsAnalytics = ReturnType<typeof useReports>["analytics"];
type InventoryPoint = ReportsAnalytics["inventoryValueOverTime"][number];
type MovementPoint = ReportsAnalytics["stockMovementOverTime"][number];
type BreakdownRow = {
  label: string;
  value: number;
  detail?: string;
};

const chartColors = ["#2f6f40", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#94a3b8"];
const chartWidth = 640;
const chartHeight = 260;
const margins = { top: 18, right: 18, bottom: 34, left: 58 };
const plotWidth = chartWidth - margins.left - margins.right;
const plotHeight = chartHeight - margins.top - margins.bottom;

const formatShortCurrency = (value: number): string =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

export function ReportAnalytics({ analytics }: { analytics: ReportsAnalytics }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <InventoryValueChart rows={analytics.inventoryValueOverTime} />
        <StockMovementBarChart rows={analytics.stockMovementOverTime} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2 2xl:grid-cols-4">
        <DonutBreakdown
          title="Inventory by Category"
          description="Current inventory value grouped by product type."
          rows={analytics.inventoryByCategory}
          centerLabel="Total"
          centerValue={formatShortCurrency(analytics.inventoryByCategory.reduce((sum, row) => sum + row.value, 0))}
          valueFormatter={formatShortCurrency}
          emptyMessage="No inventory value to chart yet."
        />
        <FastMovingItems rows={analytics.topFastMovingItems} />
        <DonutBreakdown
          title="Supplier Deductions"
          description="Cash advances, loans, and other supplier deductions."
          rows={analytics.supplierDeductionsByType}
          centerLabel="Total"
          centerValue={formatShortCurrency(analytics.supplierDeductionsByType.reduce((sum, row) => sum + row.value, 0))}
          valueFormatter={formatCurrency}
          emptyMessage="No supplier deductions recorded for this period."
        />
        <DonutBreakdown
          title="Tarha / Losses by Reason"
          description="Tarha value grouped by quality reason."
          rows={analytics.tarhaByReason}
          centerLabel="Total"
          centerValue={formatShortCurrency(analytics.tarhaByReason.reduce((sum, row) => sum + row.value, 0))}
          valueFormatter={formatCurrency}
          emptyMessage="No Tarha losses recorded yet."
        />
      </div>
      <MonthlySummary analytics={analytics} />
    </div>
  );
}

function InventoryValueChart({ rows }: { rows: InventoryPoint[] }) {
  const maxValue = Math.max(...rows.map((row) => row.value), 1);
  const xForIndex = (index: number) => margins.left + (rows.length <= 1 ? 0 : (index / (rows.length - 1)) * plotWidth);
  const yForValue = (value: number) => margins.top + plotHeight - (value / maxValue) * plotHeight;
  const points = rows.map((row, index) => ({ x: xForIndex(index), y: yForValue(row.value), row }));
  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${margins.top + plotHeight} L ${points[0].x} ${margins.top + plotHeight} Z`
    : "";
  const labelEvery = Math.max(1, Math.ceil(rows.length / 6));

  return (
    <SectionCard title="Inventory Value Over Time" description="Estimated value across the selected month.">
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="min-w-[560px]">
          <defs>
            <linearGradient id="inventoryArea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#2f6f40" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#2f6f40" stopOpacity="0.03" />
            </linearGradient>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = margins.top + plotHeight - ratio * plotHeight;
            const value = maxValue * ratio;
            return (
              <g key={ratio}>
                <line x1={margins.left} x2={chartWidth - margins.right} y1={y} y2={y} stroke="#e7e0d2" />
                <text x={margins.left - 8} y={y + 4} textAnchor="end" className="fill-muted-foreground text-[11px]">
                  {formatShortCurrency(value)}
                </text>
              </g>
            );
          })}
          {areaPath ? <path d={areaPath} fill="url(#inventoryArea)" /> : null}
          {linePath ? <path d={linePath} fill="none" stroke="#2f6f40" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /> : null}
          {points.map((point, index) => (
            <circle key={point.row.label} cx={point.x} cy={point.y} r={index % labelEvery === 0 ? 4 : 3} fill="#2f6f40" />
          ))}
          {rows.map((row, index) => index % labelEvery === 0 ? (
            <text key={row.label} x={xForIndex(index)} y={chartHeight - 10} textAnchor="middle" className="fill-muted-foreground text-[11px]">
              {row.label}
            </text>
          ) : null)}
        </svg>
      </div>
    </SectionCard>
  );
}

function StockMovementBarChart({ rows }: { rows: MovementPoint[] }) {
  const maxValue = Math.max(...rows.flatMap((row) => [row.stockIn, row.stockOut]), 1);
  const groupWidth = plotWidth / Math.max(rows.length, 1);
  const barWidth = Math.max(3, Math.min(10, groupWidth * 0.28));
  const labelEvery = Math.max(1, Math.ceil(rows.length / 6));
  const yForValue = (value: number) => margins.top + plotHeight - (value / maxValue) * plotHeight;

  return (
    <SectionCard
      title="Stock In vs Stock Out"
      description="Daily movement value for received and outgoing inventory."
      action={<ChartLegend />}
    >
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="min-w-[560px]">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = margins.top + plotHeight - ratio * plotHeight;
            return (
              <g key={ratio}>
                <line x1={margins.left} x2={chartWidth - margins.right} y1={y} y2={y} stroke="#e7e0d2" />
                <text x={margins.left - 8} y={y + 4} textAnchor="end" className="fill-muted-foreground text-[11px]">
                  {formatShortCurrency(maxValue * ratio)}
                </text>
              </g>
            );
          })}
          {rows.map((row, index) => {
            const centerX = margins.left + index * groupWidth + groupWidth / 2;
            const inY = yForValue(row.stockIn);
            const outY = yForValue(row.stockOut);
            return (
              <g key={row.label}>
                <rect x={centerX - barWidth - 1} y={inY} width={barWidth} height={margins.top + plotHeight - inY} rx="2" fill="#2f6f40" />
                <rect x={centerX + 1} y={outY} width={barWidth} height={margins.top + plotHeight - outY} rx="2" fill="#ef4444" />
                {index % labelEvery === 0 ? (
                  <text x={centerX} y={chartHeight - 10} textAnchor="middle" className="fill-muted-foreground text-[11px]">
                    {row.label}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>
    </SectionCard>
  );
}

function DonutBreakdown({
  title,
  description,
  rows,
  centerLabel,
  centerValue,
  valueFormatter,
  emptyMessage,
}: {
  title: string;
  description: string;
  rows: BreakdownRow[];
  centerLabel: string;
  centerValue: string;
  valueFormatter: (value: number) => string;
  emptyMessage: string;
}) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  let cursor = 0;
  const gradient = rows.map((row, index) => {
    const start = cursor;
    const end = cursor + (row.value / total) * 100;
    cursor = end;
    return `${chartColors[index % chartColors.length]} ${start}% ${end}%`;
  }).join(", ");

  return (
    <SectionCard title={title} description={description}>
      {rows.length > 0 && total > 0 ? (
        <div className="grid gap-5 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-center xl:grid-cols-1 2xl:grid-cols-[11rem_minmax(0,1fr)]">
          <div className="relative mx-auto h-40 w-40 rounded-full" style={{ background: `conic-gradient(${gradient})` }}>
            <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-card text-center shadow-inner">
              <span className="text-xs text-muted-foreground">{centerLabel}</span>
              <span className="text-base font-bold">{centerValue}</span>
            </div>
          </div>
          <div className="space-y-3">
            {rows.map((row, index) => {
              const percent = Math.round((row.value / total) * 100);
              return (
                <div key={row.label} className="grid grid-cols-[0.75rem_minmax(0,1fr)_auto] items-center gap-2 text-sm">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
                  <span className="truncate text-muted-foreground">{row.label}</span>
                  <span className="font-medium">{valueFormatter(row.value)} ({percent}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">{emptyMessage}</p>
      )}
    </SectionCard>
  );
}

function FastMovingItems({ rows }: { rows: BreakdownRow[] }) {
  const maxValue = Math.max(...rows.map((row) => row.value), 1);

  return (
    <SectionCard title="Top 5 Fast Moving Items" description="Products with the highest combined stock-in and stock-out movement.">
      {rows.length > 0 ? (
        <div className="space-y-4">
          {rows.map((row, index) => (
            <div key={row.label} className="grid grid-cols-[1.75rem_minmax(0,1fr)_auto] items-center gap-3 text-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-leaf-100 text-xs font-semibold text-leaf-700">{index + 1}</span>
              <div className="min-w-0">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <p className="truncate font-medium">{row.label}</p>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-leaf-500" style={{ width: `${Math.max(8, (row.value / maxValue) * 100)}%` }} />
                </div>
              </div>
              <span className="text-xs font-medium text-muted-foreground">{row.detail ?? row.value}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No product movement yet.</p>
      )}
    </SectionCard>
  );
}

function MonthlySummary({ analytics }: { analytics: ReportsAnalytics }) {
  const trend = analytics.monthlySummary.inventoryTrend;
  const direction = trend >= 0 ? "increased" : "decreased";

  return (
    <SectionCard title="Monthly Summary" description={`Reporting period: ${analytics.periodLabel}`}>
      <div className="relative overflow-hidden rounded-md border bg-gradient-to-r from-leaf-50 via-background to-leaf-50 p-4 sm:p-5">
        <div className="relative z-10 max-w-2xl space-y-2 text-sm">
          <p>
            Your inventory value {direction} by{" "}
            <span className={trend >= 0 ? "font-semibold text-leaf-700" : "font-semibold text-red-700"}>{Math.abs(trend)}%</span>{" "}
            compared with the previous month.
          </p>
          <p className="text-muted-foreground">
            {analytics.monthlySummary.lowItemCount > 0
              ? `${analytics.monthlySummary.lowItemCount} products are at or below the restock threshold. Review the Restock tab before the next purchasing cycle.`
              : "Inventory levels are currently above the restock threshold. Keep monitoring stock-out pace and Tarha losses."}
          </p>
        </div>
        <svg className="absolute bottom-0 right-0 hidden h-28 w-80 text-leaf-200 opacity-80 sm:block" viewBox="0 0 320 112" fill="none" aria-hidden="true">
          <path d="M0 104C42 84 70 68 111 79C158 92 179 39 224 48C266 56 278 20 320 8V112H0V104Z" fill="currentColor" opacity="0.45" />
          <path d="M44 100C70 70 97 56 130 65C176 77 189 34 231 40C270 46 291 22 312 12" stroke="#7fb486" strokeWidth="3" strokeLinecap="round" />
          {[70, 112, 180, 232, 276].map((x, index) => (
            <rect key={x} x={x} y={76 - index * 7} width="12" height={30 + index * 7} rx="3" fill="#7fb486" opacity="0.55" />
          ))}
        </svg>
      </div>
    </SectionCard>
  );
}

function ChartLegend() {
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-leaf-600" />Stock In</span>
      <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-500" />Stock Out</span>
    </div>
  );
}
