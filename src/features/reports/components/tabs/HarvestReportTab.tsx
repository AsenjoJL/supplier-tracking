import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Crop } from "@/features/crop-monitoring/types/crop.types";
import { formatDate } from "@/lib/utils";
import type { FirestoreDoc } from "@/types/global.types";

export function HarvestReportTab({ rows }: { rows: FirestoreDoc<Crop>[] }) {
  const columns: DataTableColumn<FirestoreDoc<Crop>>[] = [
    { id: "crop", header: "Crop", cell: (row) => <p className="font-medium">{row.name}</p> },
    { id: "planted", header: "Planted", cell: (row) => formatDate(row.plantingDate) },
    { id: "forecast", header: "Forecast", cell: (row) => formatDate(row.forecastHarvest) },
    { id: "actual", header: "Actual", cell: (row) => formatDate(row.actualHarvest) },
    { id: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    { id: "qty", header: "Qty", cell: (row) => `${row.qty} ${row.qtyUnit ?? "pcs"}` },
  ];
  return <DataTable data={rows} columns={columns} getRowId={(row) => row.id} />;
}
