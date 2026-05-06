import { AlertTriangle } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { SectionCard } from "@/components/common/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Product } from "@/features/products/types/product.types";
import type { FirestoreDoc } from "@/types/global.types";

type LowStockAlertsProps = {
  rows: { product: FirestoreDoc<Product>; currentStock: number }[];
};

export function LowStockAlerts({ rows }: LowStockAlertsProps) {
  return (
    <SectionCard title="Low Stock Alerts" description="Items at or below the restock threshold.">
      {rows.length === 0 ? (
        <EmptyState title="Inventory looks steady" description="No low or out-of-stock products right now." />
      ) : (
        <div className="space-y-3">
          {rows.map(({ product, currentStock }) => (
            <div key={product.id} className="flex items-center gap-3 rounded-md border bg-background p-3">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-muted-foreground">{product.unit}</p>
              </div>
              <StatusBadge status={currentStock <= 0 ? "out" : "low"} label={currentStock <= 0 ? "Out of stock" : `${currentStock} left`} />
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
