import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { SectionCard } from "@/components/common/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductForm } from "@/features/products/components/ProductForm";
import { useProductMutations } from "@/features/products/hooks/useProductMutations";
import { useProducts } from "@/features/products/hooks/useProducts";
import type { Product, ProductFormValues } from "@/features/products/types/product.types";
import { useStockIn } from "@/features/stock-in/hooks/useStockIn";
import { useStockOut } from "@/features/stock-out/hooks/useStockOut";
import { useSuppliers } from "@/features/suppliers/hooks/useSuppliers";
import { PRODUCT_TYPE_LABELS, PRODUCT_TYPES } from "@/lib/constants";
import { computeStockBalance, computeTarhaPricing, formatCurrency, normalizeSearch } from "@/lib/utils";
import type { FirestoreDoc } from "@/types/global.types";

type ProductRow = FirestoreDoc<Product> & {
  supplierName: string;
  currentStock: number;
  tarhaPercent: number;
  deductionAmount: number;
  finalPrice: number;
};

export function ProductList() {
  const products = useProducts();
  const suppliers = useSuppliers();
  const stockIns = useStockIn();
  const stockOuts = useStockOut();
  const mutations = useProductMutations();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<FirestoreDoc<Product> | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const rows = useMemo<ProductRow[]>(() => {
    const term = normalizeSearch(search);
    return (products.data ?? [])
      .map((product) => {
        const tarhaPercent = product.tarhaPercent ?? 0;
        const pricing = computeTarhaPricing(product.price, tarhaPercent);

        return {
          ...product,
          tarhaPercent,
          deductionAmount: product.deductionAmount ?? pricing.deductionAmount,
          finalPrice: product.finalPrice ?? pricing.finalPrice,
          supplierName: suppliers.data?.find((supplier) => supplier.id === product.supplierId)?.name ?? "Unassigned",
          currentStock: computeStockBalance(product.id, stockIns.data ?? [], stockOuts.data ?? []),
        };
      })
      .filter((product) => normalizeSearch(`${product.name} ${product.supplierName} ${product.type}`).includes(term));
  }, [products.data, search, stockIns.data, stockOuts.data, suppliers.data]);
  const productSections = useMemo(() => PRODUCT_TYPES.map((type) => ({
    type,
    label: PRODUCT_TYPE_LABELS[type],
    rows: rows.filter((row) => row.type === type),
  })).filter((section) => section.rows.length > 0), [rows]);

  const submit = (values: ProductFormValues) => {
    if (editing) mutations.updateProduct.mutate({ id: editing.id, payload: values }, { onSuccess: () => setFormOpen(false) });
    else mutations.createProduct.mutate(values, { onSuccess: () => setFormOpen(false) });
  };

  const productColumns: DataTableColumn<ProductRow>[] = [
    { id: "name", header: "Product", sortable: true, sortValue: (row) => row.name, cell: (row) => <div><p className="font-medium">{row.name}</p><p className="text-xs text-muted-foreground">{row.id}</p></div> },
    { id: "price", header: "Original Price", sortable: true, sortValue: (row) => row.price, cell: (row) => formatCurrency(row.price) },
  ];
  const supplierColumn: DataTableColumn<ProductRow> = { id: "supplier", header: "Supplier", cell: (row) => <span className="text-sm">{row.supplierName}</span> };
  const tarhaColumns: DataTableColumn<ProductRow>[] = [
    { id: "tarha", header: "Tarha Percent", sortable: true, sortValue: (row) => row.tarhaPercent, cell: (row) => `${row.tarhaPercent}%` },
    { id: "deduction", header: "Deduction", sortable: true, sortValue: (row) => row.deductionAmount, cell: (row) => formatCurrency(row.deductionAmount) },
    { id: "finalPrice", header: "Final Price", sortable: true, sortValue: (row) => row.finalPrice, cell: (row) => <span className="font-semibold text-leaf-700">{formatCurrency(row.finalPrice)}</span> },
  ];
  const trailingColumns: DataTableColumn<ProductRow>[] = [
    { id: "stock", header: "Current Stock", sortable: true, sortValue: (row) => row.currentStock, cell: (row) => <StatusBadge status={row.currentStock <= 0 ? "out" : row.currentStock <= 5 ? "low" : "ok"} label={`${row.currentStock} ${row.unit}`} /> },
    { id: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    {
      id: "actions",
      header: "Actions",
      cell: (row) => (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => { setEditing(row); setFormOpen(true); }}><Pencil className="h-3.5 w-3.5" />Edit</Button>
          <Button variant="destructive" size="sm" onClick={() => setDeleteId(row.id)}><Trash2 className="h-3.5 w-3.5" />Del</Button>
        </div>
      ),
    },
  ];
  const vegetableColumns = [productColumns[0], supplierColumn, productColumns[1], ...tarhaColumns, ...trailingColumns];
  const farmInputColumns = [...productColumns, ...trailingColumns];

  if (products.isLoading || suppliers.isLoading || stockIns.isLoading || stockOuts.isLoading) return <LoadingSpinner />;

  return (
    <PageWrapper
      title="Products"
      description="Catalog vegetables, farm inputs, units, prices, and stock state."
      action={
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="h-4 w-4" />Add Product</Button>
      }
    >
      <Input placeholder="Search products..." value={search} onChange={(event) => setSearch(event.target.value)} className="w-full max-w-md" />
      {productSections.length > 0 ? (
        <div className="space-y-6">
          {productSections.map((section) => (
            <SectionCard
              key={section.type}
              title={section.label}
              description={`${section.rows.length} ${section.rows.length === 1 ? "product" : "products"}`}
            >
              <DataTable
                data={section.rows}
                columns={section.type === "vegetable" ? vegetableColumns : farmInputColumns}
                getRowId={(row) => row.id}
                emptyMessage={`No ${section.label.toLowerCase()} products found.`}
              />
            </SectionCard>
          ))}
        </div>
      ) : (
        <EmptyState title="No products found" description="Try a different search term or add a new product." />
      )}
      <ProductForm
        open={formOpen}
        product={editing}
        onOpenChange={setFormOpen}
        onSubmit={submit}
        pending={mutations.createProduct.isPending || mutations.updateProduct.isPending}
      />
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete product?"
        description="This removes the product record. Existing stock movement history remains in Firestore."
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        onConfirm={() => deleteId && mutations.deleteProduct.mutate(deleteId, { onSuccess: () => setDeleteId(null) })}
        pending={mutations.deleteProduct.isPending}
      />
    </PageWrapper>
  );
}
