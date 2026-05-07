import { SectionCard } from "@/components/common/SectionCard";
import type { useExpenseOverview } from "@/features/expenses/hooks/useExpenseOverview";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

type ExpenseData = ReturnType<typeof useExpenseOverview>;
type BreakdownRow = ExpenseData["analytics"]["breakdownBySource"][number];
type OverTimeRow = ExpenseData["analytics"]["overTime"][number];
type CategoryRow = ExpenseData["analytics"]["byCategory"][number];
type CropRow = ExpenseData["analytics"]["byCrop"][number];

const chartColors = ["#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#2f6f40", "#94a3b8"];
const sourceColors = {
  stockIn: "#3b82f6",
  cropInput: "#8b5cf6",
  manual: "#f59e0b",
  tarha: "#ef4444",
};
const chartWidth = 640;
const chartHeight = 260;
const margins = { top: 18, right: 18, bottom: 34, left: 58 };
const plotWidth = chartWidth - margins.left - margins.right;
const plotHeight = chartHeight - margins.top - margins.bottom;

const shortCurrency = (value: number): string =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", notation: "compact", maximumFractionDigits: 1 }).format(value);

export function ExpenseCharts({ data }: { data: ExpenseData }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <ExpenseBreakdown rows={data.analytics.breakdownBySource} total={data.summary.totalExpenses} />
          <ExpensesOverTime rows={data.analytics.overTime} />
        </div>
      </div>
      <div className="space-y-6">
        <CategoryBreakdown rows={data.analytics.byCategory} total={data.summary.totalExpenses} />
        <CropExpenseBreakdown rows={data.analytics.byCrop} total={data.analytics.byCrop.reduce((sum, row) => sum + row.value, 0)} />
        <ExpenseGuide />
        <ExpenseTip />
      </div>
    </div>
  );
}

function ExpenseBreakdown({ rows, total }: { rows: BreakdownRow[]; total: number }) {
  let cursor = 0;
  const gradient = rows.map((row, index) => {
    const start = cursor;
    const end = cursor + (row.value / Math.max(total, 1)) * 100;
    cursor = end;
    return `${chartColors[index % chartColors.length]} ${start}% ${end}%`;
  }).join(", ");

  return (
    <SectionCard title="Expense Breakdown">
      {rows.length > 0 ? (
        <div className="mx-auto grid w-full max-w-sm gap-5">
          <div className="relative mx-auto h-40 w-40 rounded-full" style={{ background: `conic-gradient(${gradient})` }}>
            <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-card text-center shadow-inner">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="text-base font-bold">{formatCurrency(total)}</span>
            </div>
          </div>
          <div className="space-y-3">
            {rows.map((row, index) => {
              const percent = Math.round((row.value / Math.max(total, 1)) * 100);
              return (
                <div key={row.source} className="grid grid-cols-[0.75rem_minmax(0,1fr)] gap-x-2 text-sm">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
                  <div className="min-w-0">
                    <p className="truncate text-muted-foreground">{row.label}</p>
                    <p className="break-words font-medium">{formatCurrency(row.value)} ({percent}%)</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No expenses in this period.</p>
      )}
    </SectionCard>
  );
}

function ExpensesOverTime({ rows }: { rows: OverTimeRow[] }) {
  const maxValue = Math.max(...rows.flatMap((row) => [row.stockIn, row.cropInput, row.manual, row.tarha]), 1);
  const xForIndex = (index: number) => margins.left + (rows.length <= 1 ? 0 : (index / (rows.length - 1)) * plotWidth);
  const yForValue = (value: number) => margins.top + plotHeight - (value / maxValue) * plotHeight;
  const labelEvery = Math.max(1, Math.ceil(rows.length / 5));
  const linePath = (key: keyof Pick<OverTimeRow, "stockIn" | "cropInput" | "manual" | "tarha">) =>
    rows.map((row, index) => `${index === 0 ? "M" : "L"} ${xForIndex(index)} ${yForValue(row[key])}`).join(" ");

  return (
    <SectionCard title="Expenses Over Time">
      <div className="mb-4">
        <ExpenseLegend />
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="min-w-[560px]">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = margins.top + plotHeight - ratio * plotHeight;
            return (
              <g key={ratio}>
                <line x1={margins.left} x2={chartWidth - margins.right} y1={y} y2={y} stroke="#e7e0d2" />
                <text x={margins.left - 8} y={y + 4} textAnchor="end" className="fill-muted-foreground text-[11px]">
                  {shortCurrency(maxValue * ratio)}
                </text>
              </g>
            );
          })}
          {(["stockIn", "cropInput", "manual", "tarha"] as const).map((key) => (
            <path key={key} d={linePath(key)} fill="none" stroke={sourceColors[key]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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

function CategoryBreakdown({ rows, total }: { rows: CategoryRow[]; total: number }) {
  return (
    <SectionCard title="Expenses by Category">
      {rows.length > 0 ? (
        <div className="space-y-3">
          {rows.map((row) => {
            const percent = Math.round((row.value / Math.max(total, 1)) * 100);
            return (
              <div key={row.category} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 border-b pb-2 text-sm last:border-0 last:pb-0">
                <span className="truncate">{EXPENSE_CATEGORY_LABELS[row.category]}</span>
                <span className="font-medium">{formatCurrency(row.value)}</span>
                <span className="text-muted-foreground">{percent}%</span>
              </div>
            );
          })}
          <div className="flex justify-between border-t pt-3 text-sm font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      ) : (
        <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No category expenses yet.</p>
      )}
    </SectionCard>
  );
}

function CropExpenseBreakdown({ rows, total }: { rows: CropRow[]; total: number }) {
  const maxValue = Math.max(...rows.map((row) => row.value), 1);

  return (
    <SectionCard title="Expense from Vegetables (Crop)">
      {rows.length > 0 ? (
        <div className="space-y-4">
          {rows.map((row) => (
            <div key={row.label} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 text-sm">
              <div className="min-w-0">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <p className="truncate font-medium">{row.label}</p>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-violet-500" style={{ width: `${Math.max(6, (row.value / maxValue) * 100)}%` }} />
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(row.value)}</p>
                <p className="text-xs text-muted-foreground">{Math.round((row.value / Math.max(total, 1)) * 100)}%</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No crop-linked expenses yet.</p>
      )}
    </SectionCard>
  );
}

function ExpenseGuide() {
  return (
    <SectionCard title="How Expenses Are Calculated">
      <div className="grid gap-3 text-sm md:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
        <GuideItem title="From Stock In" text="Purchases are recorded from stock-in transaction final prices." />
        <GuideItem title="From Vegetables" text="Allocated crop inputs are valued from the linked product unit price." />
        <GuideItem title="Manual Expenses" text="Labor, transportation, utilities, and other non-inventory costs are added manually." />
      </div>
    </SectionCard>
  );
}

function ExpenseTip() {
  return (
    <div className="relative overflow-hidden rounded-lg border bg-gradient-to-r from-leaf-50 via-background to-leaf-100 p-4 shadow-soft">
      <div className="relative z-10 max-w-md">
        <p className="font-serif text-xl">Tip</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Keep expenses updated to see accurate profit and better farming decisions.
        </p>
      </div>
      <svg className="absolute bottom-0 right-0 h-24 w-48 text-leaf-200 opacity-80" viewBox="0 0 192 96" fill="none" aria-hidden="true">
        <path d="M0 88C28 72 47 62 74 68C106 75 120 38 150 44C171 48 180 22 192 14V96H0V88Z" fill="currentColor" />
        <path d="M28 86C48 62 68 54 92 60C123 68 135 36 160 40C174 42 184 24 190 16" stroke="#7fb486" strokeWidth="3" strokeLinecap="round" />
        <circle cx="146" cy="67" r="11" fill="#2f6f40" opacity="0.25" />
        <rect x="118" y="61" width="9" height="28" rx="2" fill="#7fb486" />
        <rect x="136" y="53" width="9" height="36" rx="2" fill="#7fb486" />
        <rect x="154" y="43" width="9" height="46" rx="2" fill="#7fb486" />
      </svg>
    </div>
  );
}

function GuideItem({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{text}</p>
    </div>
  );
}

function ExpenseLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
      <LegendDot color={sourceColors.stockIn} label="From Stock In" />
      <LegendDot color={sourceColors.cropInput} label="From Vegetables" />
      <LegendDot color={sourceColors.manual} label="Manual" />
      <LegendDot color={sourceColors.tarha} label="Tarha" />
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
