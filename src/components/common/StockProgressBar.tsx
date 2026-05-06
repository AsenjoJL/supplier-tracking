import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { cn } from "@/lib/utils";

type StockProgressBarProps = {
  currentStock: number;
  unit: string;
  max?: number;
};

export function StockProgressBar({ currentStock, unit, max }: StockProgressBarProps) {
  const baseline = Math.max(max ?? 20, currentStock + LOW_STOCK_THRESHOLD);
  const percent = Math.max(0, Math.min(100, Math.round((currentStock / baseline) * 100)));
  const tone = currentStock <= 0 ? "bg-red-500" : currentStock <= LOW_STOCK_THRESHOLD ? "bg-amber-500" : "bg-leaf-500";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">{currentStock} {unit}</span>
        <span className="text-muted-foreground">{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all", tone)} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
