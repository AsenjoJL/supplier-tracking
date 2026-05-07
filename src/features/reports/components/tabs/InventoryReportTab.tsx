import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { SectionCard } from "@/components/common/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { useReports } from "@/features/reports/hooks/useReports";
import { PRODUCT_TYPE_LABELS, PRODUCT_TYPES } from "@/lib/constants";

type InventoryRow = ReturnType<typeof useReports>["stockRows"][number];

export function InventoryReportTab({ rows }: { rows: InventoryRow[] }) {
  const productColumn: DataTableColumn<InventoryRow> = { id: "product", header: "Product", cell: (row) => <p className="font-medium">{row.product.name}</p> };
  const supplierColumn: DataTableColumn<InventoryRow> = { id: "supplier", header: "Supplier", cell: (row) => row.supplier?.name ?? "—" };
  const sharedColumns: DataTableColumn<InventoryRow>[] = [
    { id: "type", header: "Type", cell: (row) => <StatusBadge status={row.product.type} /> },
    { id: "in", header: "Stock In", cell: (row) => <span className="text-leaf-700">+{row.totalIn}</span> },
    { id: "out", header: "Stock Out", cell: (row) => <span className="text-red-700">-{row.totalOut}</span> },
    { id: "current", header: "Current", sortable: true, sortValue: (row) => row.currentStock, cell: (row) => <span className="font-semibold">{row.currentStock} {row.product.unit}</span> },
  ];
  const vegetableColumns: DataTableColumn<InventoryRow>[] = [
    productColumn,
    supplierColumn,
    ...sharedColumns,
  ];
  const inputColumns: DataTableColumn<InventoryRow>[] = [
    productColumn,
    ...sharedColumns,
  ];
  const sections = PRODUCT_TYPES.map((type) => ({
    type,
    rows: rows.filter((row) => row.product.type === type),
  })).filter((section) => section.rows.length > 0);

  if (sections.length === 0) {
    return <DataTable data={[]} columns={vegetableColumns} getRowId={(row) => row.product.id} emptyMessage="No inventory rows found for this period." />;
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <SectionCard
          key={section.type}
          title={PRODUCT_TYPE_LABELS[section.type]}
          description={`${section.rows.length} ${section.rows.length === 1 ? "item" : "items"}`}
        >
          <DataTable
            data={section.rows}
            columns={section.type === "vegetable" ? vegetableColumns : inputColumns}
            getRowId={(row) => row.product.id}
          />
        </SectionCard>
      ))}
    </div>
  );
}
