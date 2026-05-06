import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { useReports } from "@/features/reports/hooks/useReports";

type InventoryRow = ReturnType<typeof useReports>["stockRows"][number];

export function InventoryReportTab({ rows }: { rows: InventoryRow[] }) {
  const columns: DataTableColumn<InventoryRow>[] = [
    { id: "product", header: "Product", cell: (row) => <p className="font-medium">{row.product.name}</p> },
    { id: "type", header: "Type", cell: (row) => <StatusBadge status={row.product.type} /> },
    { id: "supplier", header: "Supplier", cell: (row) => row.supplier?.name ?? "—" },
    { id: "in", header: "Stock In", cell: (row) => <span className="text-leaf-700">+{row.totalIn}</span> },
    { id: "out", header: "Stock Out", cell: (row) => <span className="text-red-700">-{row.totalOut}</span> },
    { id: "current", header: "Current", sortable: true, sortValue: (row) => row.currentStock, cell: (row) => <span className="font-semibold">{row.currentStock} {row.product.unit}</span> },
  ];
  return <DataTable data={rows} columns={columns} getRowId={(row) => row.product.id} />;
}
