import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { useCrops } from "@/features/crop-monitoring/hooks/useCrops";
import { useProducts } from "@/features/products/hooks/useProducts";
import { StockOutForm } from "@/features/stock-out/components/StockOutForm";
import { StockOutPurposeBadge } from "@/features/stock-out/components/StockOutPurposeBadge";
import { useStockOut } from "@/features/stock-out/hooks/useStockOut";
import { useStockOutMutations } from "@/features/stock-out/hooks/useStockOutMutations";
import type { StockOut, StockOutFormValues } from "@/features/stock-out/types/stock-out.types";
import { formatDate } from "@/lib/utils";
import type { FirestoreDoc } from "@/types/global.types";

type StockOutRow = FirestoreDoc<StockOut> & {
  productName: string;
  cropName: string;
};

export function StockOutList() {
  const stockOuts = useStockOut();
  const products = useProducts();
  const crops = useCrops();
  const mutations = useStockOutMutations();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const rows = useMemo<StockOutRow[]>(() => (stockOuts.data ?? []).map((stockOut) => ({
    ...stockOut,
    productName: products.data?.find((product) => product.id === stockOut.productId)?.name ?? "Unknown product",
    cropName: crops.data?.find((crop) => crop.id === stockOut.cropId)?.name ?? "—",
  })), [crops.data, products.data, stockOuts.data]);

  const columns: DataTableColumn<StockOutRow>[] = [
    { id: "date", header: "Date", sortable: true, sortValue: (row) => row.date, cell: (row) => formatDate(row.date) },
    { id: "product", header: "Product", cell: (row) => <p className="font-medium">{row.productName}</p> },
    { id: "qty", header: "Qty Out", sortable: true, sortValue: (row) => row.qty, cell: (row) => <span className="font-semibold text-red-700">-{row.qty} {row.unit}</span> },
    { id: "purpose", header: "Purpose", cell: (row) => <StockOutPurposeBadge purpose={row.purpose} /> },
    { id: "crop", header: "Crop/Ref", cell: (row) => row.cropName },
    { id: "remarks", header: "Remarks", cell: (row) => <span className="text-sm text-muted-foreground">{row.remarks || "—"}</span> },
    {
      id: "actions",
      header: "Actions",
      cell: (row) => (
        <Button variant="destructive" size="sm" onClick={() => setDeleteId(row.id)}>
          <Trash2 className="h-3.5 w-3.5" />
          Del
        </Button>
      ),
    },
  ];

  const submit = (values: StockOutFormValues) => {
    mutations.createStockOut.mutate(values, { onSuccess: () => setFormOpen(false) });
  };

  if (stockOuts.isLoading || products.isLoading || crops.isLoading) return <LoadingSpinner />;

  return (
    <PageWrapper
      title="Stock Out"
      description="Track sold, transferred, damaged, returned, and crop-used inventory."
      action={<Button onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" />Record Stock-Out</Button>}
    >
      <DataTable data={rows} columns={columns} getRowId={(row) => row.id} />
      <StockOutForm open={formOpen} onOpenChange={setFormOpen} onSubmit={submit} pending={mutations.createStockOut.isPending} />
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete stock-out record?"
        description="This removes the outgoing stock record and updates computed product balances."
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        onConfirm={() => deleteId && mutations.deleteStockOut.mutate(deleteId, { onSuccess: () => setDeleteId(null) })}
        pending={mutations.deleteStockOut.isPending}
      />
    </PageWrapper>
  );
}
