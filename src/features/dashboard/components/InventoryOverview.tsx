import { StockProgressBar } from "@/components/common/StockProgressBar";
import { SectionCard } from "@/components/common/SectionCard";
import type { Product } from "@/features/products/types/product.types";
import type { FirestoreDoc } from "@/types/global.types";

type InventoryOverviewProps = {
  rows: { product: FirestoreDoc<Product>; currentStock: number }[];
};

export function InventoryOverview({ rows }: InventoryOverviewProps) {
  return (
    <SectionCard title="Inventory Overview" description="Current computed stock by product.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.slice(0, 12).map(({ product, currentStock }) => (
          <div key={product.id} className="rounded-md border bg-background p-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="font-medium">{product.name}</p>
              <span className="text-xs text-muted-foreground">{product.unit}</span>
            </div>
            <StockProgressBar currentStock={currentStock} unit={product.unit} />
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
