import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { useReports } from "@/features/reports/hooks/useReports";
import { isSupplierInputDeductionType } from "@/features/suppliers/lib/supplierDeductionUtils";
import { SUPPLIER_DEDUCTION_STATUS_LABELS, SUPPLIER_DEDUCTION_TYPE_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

type SupplierDeductionReportRow = ReturnType<typeof useReports>["supplierDeductionRows"][number];

export function SupplierDeductionsReportTab({ rows }: { rows: SupplierDeductionReportRow[] }) {
  const columns: DataTableColumn<SupplierDeductionReportRow>[] = [
    { id: "date", header: "Date", sortable: true, sortValue: (row) => row.deduction.date, cell: (row) => formatDate(row.deduction.date) },
    { id: "supplier", header: "Supplier", cell: (row) => row.supplier?.name ?? "Unknown supplier" },
    { id: "type", header: "Type", cell: (row) => SUPPLIER_DEDUCTION_TYPE_LABELS[row.deduction.type] },
    {
      id: "details",
      header: "Details",
      cell: (row) => isSupplierInputDeductionType(row.deduction.type) ? (
        <div className="text-sm">
          <p className="font-medium">{row.deduction.inputProductName || "Input product"}</p>
          <p className="text-muted-foreground">
            {row.deduction.inputQty ?? 0} {row.deduction.inputUnit || "unit"} x {formatCurrency(row.deduction.inputUnitPrice ?? 0)}
          </p>
        </div>
      ) : <span className="text-sm text-muted-foreground">—</span>,
    },
    { id: "amount", header: "Amount", sortable: true, sortValue: (row) => row.deduction.amount, cell: (row) => <span className="font-semibold">{formatCurrency(row.deduction.amount)}</span> },
    { id: "status", header: "Status", cell: (row) => <StatusBadge status={row.deduction.status} label={SUPPLIER_DEDUCTION_STATUS_LABELS[row.deduction.status]} /> },
    { id: "remarks", header: "Remarks", cell: (row) => <span className="text-sm text-muted-foreground">{row.deduction.remarks || "—"}</span> },
  ];

  return <DataTable data={rows} columns={columns} getRowId={(row) => row.deduction.id} emptyMessage="No supplier deductions found for this period." />;
}
