import { useState } from "react";
import { Plus } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { FarmInputForm } from "@/features/farm-inputs/components/FarmInputForm";
import { RestockStatusBadge } from "@/features/farm-inputs/components/RestockStatusBadge";
import { useFarmInputs } from "@/features/farm-inputs/hooks/useFarmInputs";
import { useProductMutations } from "@/features/products/hooks/useProductMutations";
import type { Product, ProductFormValues } from "@/features/products/types/product.types";
import { useSuppliers } from "@/features/suppliers/hooks/useSuppliers";
import { formatCurrency } from "@/lib/utils";
import type { FirestoreDoc } from "@/types/global.types";

type FarmInputRow = {
  product: FirestoreDoc<Product>;
  currentStock: number;
  supplierName: string;
};

export function FarmInputList() {
  const farmInputs = useFarmInputs();
  const suppliers = useSuppliers();
  const mutations = useProductMutations();
  const [formOpen, setFormOpen] = useState(false);

  const rows: FarmInputRow[] = farmInputs.rows.map((row) => ({
    ...row,
    supplierName: suppliers.data?.find((supplier) => supplier.id === row.product.supplierId)?.name ?? "Unassigned",
  }));

  const columns: DataTableColumn<FarmInputRow>[] = [
    { id: "name", header: "Input", sortable: true, sortValue: (row) => row.product.name, cell: (row) => <p className="font-medium">{row.product.name}</p> },
    { id: "category", header: "Category", cell: (row) => <StatusBadge status={row.product.type} /> },
    { id: "supplier", header: "Supplier", cell: (row) => row.supplierName },
    { id: "price", header: "Price", cell: (row) => formatCurrency(row.product.price) },
    { id: "stock", header: "Current Stock", cell: (row) => <StatusBadge status={row.currentStock <= 0 ? "out" : row.currentStock <= 5 ? "low" : "ok"} label={`${row.currentStock} ${row.product.unit}`} /> },
    { id: "restock", header: "Restock", cell: (row) => <RestockStatusBadge currentStock={row.currentStock} /> },
  ];

  const submit = (values: ProductFormValues) => {
    mutations.createProduct.mutate(values, { onSuccess: () => setFormOpen(false) });
  };

  if (farmInputs.isLoading || suppliers.isLoading) return <LoadingSpinner />;

  return (
    <PageWrapper
      title="Farm Inputs"
      description="Monitor abuno, fertilizers, medicine, green solution, and seed inventory."
      action={<Button onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" />Add Farm Input</Button>}
    >
      <DataTable data={rows} columns={columns} getRowId={(row) => row.product.id} />
      <FarmInputForm open={formOpen} onOpenChange={setFormOpen} onSubmit={submit} pending={mutations.createProduct.isPending} />
    </PageWrapper>
  );
}
