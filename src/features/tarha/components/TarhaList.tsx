import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { useTarhaRecords } from "@/features/tarha/hooks/useTarhaRecords";
import { TARHA_REASON_LABELS } from "@/lib/constants";
import { computeStockInPricing, formatCurrency, formatDate } from "@/lib/utils";
import { TarhaReasonGuide } from "./TarhaReasonGuide";
import { TarhaSummaryCards } from "./TarhaSummaryCards";

type TarhaRow = ReturnType<typeof useTarhaRecords>["records"][number];

export function TarhaList() {
  const tarha = useTarhaRecords();
  const getTarhaValue = (row: TarhaRow): number =>
    row.stockIn.deductionAmount ?? computeStockInPricing(row.stockIn.qty, row.stockIn.originalPrice, row.stockIn.tarhaQty).deductionAmount;

  const columns: DataTableColumn<TarhaRow>[] = [
    { id: "product", header: "Product", cell: (row) => <p className="font-medium">{row.product?.name ?? "Unknown product"}</p> },
    { id: "date", header: "Date", sortable: true, sortValue: (row) => row.stockIn.date, cell: (row) => formatDate(row.stockIn.date) },
    { id: "reason", header: "Reason", cell: (row) => row.stockIn.tarhaReason ? <StatusBadge status={row.stockIn.tarhaReason} label={TARHA_REASON_LABELS[row.stockIn.tarhaReason]} /> : "—" },
    { id: "qty", header: "Tarha Qty", cell: (row) => `${row.stockIn.tarhaQty} ${row.stockIn.unit}` },
    { id: "deduction", header: "Tarha Value", cell: (row) => <span className="text-red-700">{formatCurrency(getTarhaValue(row))}</span> },
    { id: "final", header: "Final", cell: (row) => <span className="font-semibold text-leaf-700">{formatCurrency(row.stockIn.finalPrice)}</span> },
  ];

  if (tarha.isLoading) return <LoadingSpinner />;

  return (
    <PageWrapper title="Tarha Management" description="Track quality deductions applied to received goods.">
      <TarhaSummaryCards recordCount={tarha.records.length} totalDeductions={tarha.totalDeductions} />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <DataTable data={tarha.records} columns={columns} getRowId={(row) => row.stockIn.id} />
        <TarhaReasonGuide />
      </div>
    </PageWrapper>
  );
}
