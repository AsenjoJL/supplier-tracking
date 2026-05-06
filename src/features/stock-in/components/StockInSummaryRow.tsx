import { Pencil } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/features/products/types/product.types";
import type { StockIn } from "@/features/stock-in/types/stock-in.types";
import { TARHA_REASON_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { FirestoreDoc } from "@/types/global.types";

type StockInSummaryRowProps = {
  stockIn: FirestoreDoc<StockIn>;
  product?: FirestoreDoc<Product>;
  supplierName?: string;
  showEmptyTarhaLabel?: boolean;
  onEdit?: (stockIn: FirestoreDoc<StockIn>) => void;
};

export function StockInSummaryRow({ stockIn, product, supplierName, showEmptyTarhaLabel = true, onEdit }: StockInSummaryRowProps) {
  const tarhaPercent = stockIn.tarhaPercent ?? (stockIn.qty > 0 && stockIn.tarhaQty > 0 ? Number(((stockIn.tarhaQty / stockIn.qty) * 100).toFixed(2)) : 0);
  const tarhaPercentLabel = Number.isInteger(tarhaPercent) ? `${tarhaPercent}%` : `${tarhaPercent.toFixed(2)}%`;

  return (
    <div className="grid gap-3 border-b py-3 text-sm sm:grid-cols-2 md:grid-cols-[1fr_1fr_0.7fr_1fr_1fr_auto] md:items-center">
      <div>
        <p className="font-medium">{product?.name ?? "Unknown product"}</p>
        <p className="text-xs text-muted-foreground">{supplierName ?? "Unknown supplier"}</p>
      </div>
      <p>{formatDate(stockIn.date)}</p>
      <p className="font-semibold text-leaf-700">+{stockIn.qty} {stockIn.unit}</p>
      <div>
        {stockIn.tarhaQty > 0 && stockIn.tarhaReason ? (
          <StatusBadge status={stockIn.tarhaReason} label={`${TARHA_REASON_LABELS[stockIn.tarhaReason]} · ${stockIn.tarhaQty} (${tarhaPercentLabel})`} />
        ) : showEmptyTarhaLabel ? (
          <span className="text-muted-foreground">No Tarha</span>
        ) : null}
      </div>
      <p className="font-medium">{formatCurrency(stockIn.finalPrice)}</p>
      {onEdit ? (
        <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => onEdit(stockIn)}>
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
      ) : null}
    </div>
  );
}
