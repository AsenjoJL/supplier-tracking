import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { SectionCard } from "@/components/common/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { useReports } from "@/features/reports/hooks/useReports";
import { PRODUCT_TYPE_LABELS, PRODUCT_TYPES } from "@/lib/constants";

type RestockRow = ReturnType<typeof useReports>["lowItems"][number];

export function RestockReportTab({ rows }: { rows: RestockRow[] }) {
  const productColumn: DataTableColumn<RestockRow> = { id: "product", header: "Product", cell: (row) => <p className="font-medium">{row.product.name}</p> };
  const supplierColumn: DataTableColumn<RestockRow> = { id: "supplier", header: "Supplier", cell: (row) => row.supplier?.name ?? "—" };
  const sharedColumns: DataTableColumn<RestockRow>[] = [
    { id: "type", header: "Type", cell: (row) => <StatusBadge status={row.product.type} /> },
    { id: "stock", header: "Current Stock", sortable: true, sortValue: (row) => row.currentStock, cell: (row) => <StatusBadge status={row.currentStock <= 0 ? "out" : "low"} label={`${row.currentStock} ${row.product.unit}`} /> },
  ];
  const vegetableColumns: DataTableColumn<RestockRow>[] = [productColumn, supplierColumn, ...sharedColumns];
  const inputColumns: DataTableColumn<RestockRow>[] = [productColumn, ...sharedColumns];
  const sections = PRODUCT_TYPES.map((type) => ({
    type,
    rows: rows.filter((row) => row.product.type === type),
  })).filter((section) => section.rows.length > 0);

  if (sections.length === 0) {
    return <DataTable data={[]} columns={vegetableColumns} getRowId={(row) => row.product.id} emptyMessage="No low stock rows found." />;
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <SectionCard
          key={section.type}
          title={PRODUCT_TYPE_LABELS[section.type]}
          description={`${section.rows.length} ${section.rows.length === 1 ? "low item" : "low items"}`}
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
