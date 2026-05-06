import { StockProgressBar } from "@/components/common/StockProgressBar";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { SupplierProductStock } from "@/features/suppliers/hooks/useSupplierDetail";
import { PRODUCT_TYPE_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

type SupplierProfileProductsProps = {
  productStock: SupplierProductStock[];
  title?: string;
  description?: string;
};

export function SupplierProfileProducts({
  productStock,
  title = "Products",
  description = "Linked vegetables, farm inputs, and current balances.",
}: SupplierProfileProductsProps) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="font-serif text-xl">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {productStock.length > 0 ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {productStock.map(({ product, stock, stockInQty, stockOutQty }) => (
            <article key={product.id} className="rounded-md border bg-card p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {PRODUCT_TYPE_LABELS[product.type]} - {formatCurrency(product.price)} / {product.unit}
                  </p>
                </div>
                <StatusBadge status={product.type} />
              </div>
              <StockProgressBar currentStock={stock} unit={product.unit} />
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="rounded-md bg-muted/40 px-2 py-1">In: {stockInQty} {product.unit}</div>
                <div className="rounded-md bg-muted/40 px-2 py-1">Out: {stockOutQty} {product.unit}</div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No linked products yet.</p>
      )}
    </section>
  );
}
