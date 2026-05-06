import { useMemo, useState } from "react";
import { Eye, Pencil, Plus, Wheat } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { AllocateInputsModal } from "@/features/crop-monitoring/components/AllocateInputsModal";
import { CropDetailView } from "@/features/crop-monitoring/components/CropDetailView";
import { CropForm } from "@/features/crop-monitoring/components/CropForm";
import { CropStatusSelect } from "@/features/crop-monitoring/components/CropStatusSelect";
import { useCropMutations } from "@/features/crop-monitoring/hooks/useCropMutations";
import { useCrops } from "@/features/crop-monitoring/hooks/useCrops";
import type { Crop, CropFormValues, CropStatus } from "@/features/crop-monitoring/types/crop.types";
import { useStockOut } from "@/features/stock-out/hooks/useStockOut";
import { useSuppliers } from "@/features/suppliers/hooks/useSuppliers";
import { daysBetween, formatDate, todayISO } from "@/lib/utils";
import type { FirestoreDoc } from "@/types/global.types";

type CropRow = FirestoreDoc<Crop> & {
  supplierName: string;
  allocationCount: number;
};

export function CropList() {
  const crops = useCrops();
  const suppliers = useSuppliers();
  const stockOuts = useStockOut();
  const mutations = useCropMutations();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FirestoreDoc<Crop> | null>(null);
  const [detail, setDetail] = useState<FirestoreDoc<Crop> | null>(null);
  const [allocating, setAllocating] = useState<FirestoreDoc<Crop> | null>(null);

  const rows = useMemo<CropRow[]>(() => (crops.data ?? []).map((crop) => ({
    ...crop,
    supplierName: suppliers.data?.find((supplier) => supplier.id === crop.supplierId)?.name ?? "Unassigned",
    allocationCount: (stockOuts.data ?? []).filter((stockOut) => stockOut.cropId === crop.id).length,
  })), [crops.data, stockOuts.data, suppliers.data]);

  const columns: DataTableColumn<CropRow>[] = [
    { id: "crop", header: "Crop", sortable: true, sortValue: (row) => row.name, cell: (row) => <div><p className="font-medium">{row.name}</p><p className="text-xs text-muted-foreground">{row.supplierName}</p></div> },
    { id: "planted", header: "Planted", cell: (row) => formatDate(row.plantingDate) },
    { id: "forecast", header: "Forecast", sortable: true, sortValue: (row) => row.forecastHarvest, cell: (row) => <div><p>{formatDate(row.forecastHarvest)}</p><p className="text-xs text-muted-foreground">{daysBetween(todayISO(), row.forecastHarvest)} days</p></div> },
    { id: "qty", header: "Qty", cell: (row) => `${row.qty} ${row.qtyUnit ?? "pcs"}` },
    { id: "status", header: "Status", cell: (row) => <CropStatusSelect value={row.status} disabled={mutations.updateCrop.isPending} onChange={(status: CropStatus) => mutations.updateCrop.mutate({ id: row.id, payload: { status } })} /> },
    { id: "inputs", header: "Inputs", cell: (row) => <StatusBadge status="blue" label={`${row.allocationCount} inputs`} /> },
    {
      id: "actions",
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setDetail(row)}><Eye className="h-3.5 w-3.5" />Details</Button>
          <Button variant="outline" size="sm" onClick={() => setAllocating(row)}><Wheat className="h-3.5 w-3.5" />Input</Button>
          <Button variant="outline" size="sm" onClick={() => { setEditing(row); setFormOpen(true); }}><Pencil className="h-3.5 w-3.5" />Edit</Button>
        </div>
      ),
    },
  ];

  const submit = (values: CropFormValues) => {
    if (editing) mutations.updateCrop.mutate({ id: editing.id, payload: values }, { onSuccess: () => setFormOpen(false) });
    else mutations.createCrop.mutate(values, { onSuccess: () => setFormOpen(false) });
  };

  if (crops.isLoading || suppliers.isLoading || stockOuts.isLoading) return <LoadingSpinner />;

  return (
    <PageWrapper
      title="Crop Monitoring"
      description="Track planting, crop status, expected harvest, and input allocations."
      action={<Button onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="h-4 w-4" />Add Crop</Button>}
    >
      <DataTable data={rows} columns={columns} getRowId={(row) => row.id} />
      <CropForm open={formOpen} crop={editing} onOpenChange={setFormOpen} onSubmit={submit} pending={mutations.createCrop.isPending || mutations.updateCrop.isPending} />
      <CropDetailView crop={detail} open={detail !== null} onOpenChange={(open) => { if (!open) setDetail(null); }} />
      <AllocateInputsModal crop={allocating} open={allocating !== null} onOpenChange={(open) => { if (!open) setAllocating(null); }} />
    </PageWrapper>
  );
}
