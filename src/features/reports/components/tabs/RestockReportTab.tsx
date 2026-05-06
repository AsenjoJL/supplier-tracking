import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { useReports } from "@/features/reports/hooks/useReports";

type RestockRow = ReturnType<typeof useReports>["lowItems"][number];

export function RestockReportTab({ rows }: { rows: RestockRow[] }) {
  const columns: DataTableColumn<RestockRow>[] = [
    { id: "product", header: "Product", cell: (row) => <p className="font-medium">{row.product.name}</p> },
    { id: "supplier", header: "Supplier", cell: (row) => row.supplier?.name ?? "—" },
    { id: "type", header: "Type", cell: (row) => <StatusBadge status={row.product.type} /> },
    { id: "stock", header: "Current Stock", sortable: true, sortValue: (row) => row.currentStock, cell: (row) => <StatusBadge status={row.currentStock <= 0 ? "out" : "low"} label={`${row.currentStock} ${row.product.unit}`} /> },
  ];
  return <DataTable data={rows} columns={columns} getRowId={(row) => row.product.id} />;
}
