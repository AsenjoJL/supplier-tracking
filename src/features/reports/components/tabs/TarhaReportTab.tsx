import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { StockIn } from "@/features/stock-in/types/stock-in.types";
import { TARHA_REASON_LABELS } from "@/lib/constants";
import { computeStockInPricing, formatCurrency, formatDate } from "@/lib/utils";
import type { FirestoreDoc } from "@/types/global.types";

export function TarhaReportTab({ rows }: { rows: FirestoreDoc<StockIn>[] }) {
  const getTarhaValue = (row: FirestoreDoc<StockIn>): number =>
    row.deductionAmount ?? computeStockInPricing(row.qty, row.originalPrice, row.tarhaQty).deductionAmount;

  const columns: DataTableColumn<FirestoreDoc<StockIn>>[] = [
    { id: "date", header: "Date", cell: (row) => formatDate(row.date) },
    { id: "reason", header: "Reason", cell: (row) => row.tarhaReason ? <StatusBadge status={row.tarhaReason} label={TARHA_REASON_LABELS[row.tarhaReason]} /> : "—" },
    { id: "qty", header: "Tarha Qty", cell: (row) => `${row.tarhaQty} ${row.unit}` },
    { id: "deduction", header: "Tarha Value", cell: (row) => formatCurrency(getTarhaValue(row)) },
    { id: "final", header: "Final", cell: (row) => formatCurrency(row.finalPrice) },
  ];
  return <DataTable data={rows} columns={columns} getRowId={(row) => row.id} />;
}
