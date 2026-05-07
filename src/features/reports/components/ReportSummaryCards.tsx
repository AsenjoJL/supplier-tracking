import { ArrowDownToLine, ArrowUpFromLine, Scale, WalletCards } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";

type ReportSummaryCardsProps = {
  totalInventoryValue: number;
  totalStockInValue: number;
  totalStockOutValue: number;
  tarhaDeductions: number;
  trends: {
    inventory: number;
    stockIn: number;
    stockOut: number;
    tarha: number;
  };
};

const cards = [
  {
    key: "inventory",
    label: "Total Inventory Value",
    icon: WalletCards,
    tone: "green",
  },
  {
    key: "stockIn",
    label: "Total Stock In",
    icon: ArrowDownToLine,
    tone: "blue",
  },
  {
    key: "stockOut",
    label: "Total Stock Out",
    icon: ArrowUpFromLine,
    tone: "amber",
  },
  {
    key: "tarha",
    label: "Tarha / Losses",
    icon: Scale,
    tone: "red",
  },
] as const;

const toneClasses = {
  green: "bg-leaf-100 text-leaf-700",
  blue: "bg-sky-100 text-sky-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
};

export function ReportSummaryCards({
  totalInventoryValue,
  totalStockInValue,
  totalStockOutValue,
  tarhaDeductions,
  trends,
}: ReportSummaryCardsProps) {
  const values = {
    inventory: totalInventoryValue,
    stockIn: totalStockInValue,
    stockOut: totalStockOutValue,
    tarha: tarhaDeductions,
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const trend = trends[card.key];
        const isPositive = trend >= 0;

        return (
          <Card key={card.key} className="shadow-sm">
            <CardContent className="flex items-center gap-4 p-4 sm:p-5">
              <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full", toneClasses[card.tone])}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-muted-foreground">{card.label}</p>
                <p className={cn("mt-1 truncate text-xl font-bold", card.tone === "red" ? "text-red-600" : "text-leaf-700")}>
                  {formatCurrency(values[card.key])}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  <span className={isPositive ? "font-semibold text-leaf-600" : "font-semibold text-red-600"}>
                    {isPositive ? "+" : ""}
                    {trend}%
                  </span>{" "}
                  vs last month
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
