import { ArrowDownToLine, ReceiptText, Scale, Sprout, WalletCards } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";

type ExpenseSummaryCardsProps = {
  summary: {
    totalExpenses: number;
    stockInPurchases: number;
    cropInputExpenses: number;
    manualExpenses: number;
    tarhaLosses: number;
    trends: {
      total: number;
      stockIn: number;
      cropInput: number;
      manual: number;
      tarha: number;
    };
  };
};

const cardConfig = [
  { key: "total", label: "Total Expenses", valueKey: "totalExpenses", icon: WalletCards, tone: "green" },
  { key: "stockIn", label: "From Stock In", valueKey: "stockInPurchases", icon: ArrowDownToLine, tone: "blue" },
  { key: "cropInput", label: "From Vegetables (Crop)", valueKey: "cropInputExpenses", icon: Sprout, tone: "purple" },
  { key: "manual", label: "Manual Expenses", valueKey: "manualExpenses", icon: ReceiptText, tone: "amber" },
  { key: "tarha", label: "Tarha / Losses", valueKey: "tarhaLosses", icon: Scale, tone: "red" },
] as const;

const toneClasses = {
  green: "bg-leaf-100 text-leaf-700",
  blue: "bg-sky-100 text-sky-700",
  purple: "bg-violet-100 text-violet-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
};

export function ExpenseSummaryCards({ summary }: ExpenseSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cardConfig.map((card) => {
        const Icon = card.icon;
        const trend = summary.trends[card.key];
        const isPositive = trend >= 0;

        return (
          <Card key={card.key}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full", toneClasses[card.tone])}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-muted-foreground">{card.label}</p>
                <p className={cn("mt-1 truncate text-lg font-bold", card.tone === "red" ? "text-red-600" : "text-leaf-700")}>
                  {formatCurrency(summary[card.valueKey])}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  <span className={isPositive ? "font-semibold text-leaf-600" : "font-semibold text-red-600"}>
                    {isPositive ? "+" : ""}
                    {trend}%
                  </span>{" "}
                  vs previous period
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
