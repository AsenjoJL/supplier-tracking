import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { SectionCard } from "@/components/common/SectionCard";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/features/products/hooks/useProducts";
import type { Product } from "@/features/products/types/product.types";
import { StockInForm } from "@/features/stock-in/components/StockInForm";
import { StockInSummaryRow } from "@/features/stock-in/components/StockInSummaryRow";
import { useStockIn } from "@/features/stock-in/hooks/useStockIn";
import { useStockInMutations } from "@/features/stock-in/hooks/useStockInMutations";
import type { StockIn, StockInFormValues } from "@/features/stock-in/types/stock-in.types";
import { useSuppliers } from "@/features/suppliers/hooks/useSuppliers";
import type { Supplier } from "@/features/suppliers/types/supplier.types";
import { FARM_INPUT_TYPES } from "@/lib/constants";
import { computeStockInPricing } from "@/lib/utils";
import type { FirestoreDoc } from "@/types/global.types";

type StockInTableProps = {
  title: string;
  description: string;
  emptyTitle: string;
  showEmptyTarhaLabel?: boolean;
  stockIns: FirestoreDoc<StockIn>[];
  productsById: Map<string, FirestoreDoc<Product>>;
  suppliersById: Map<string, FirestoreDoc<Supplier>>;
  onEdit: (stockIn: FirestoreDoc<StockIn>) => void;
};

const toStockInFormValues = (stockIn: FirestoreDoc<StockIn>): StockInFormValues => ({
  supplierId: stockIn.supplierId,
  productId: stockIn.productId,
  qty: stockIn.qty,
  unit: stockIn.unit,
  originalPrice: stockIn.originalPrice,
  tarhaPercent: stockIn.tarhaPercent ?? (stockIn.qty > 0 ? Number(((stockIn.tarhaQty / stockIn.qty) * 100).toFixed(2)) : 0),
  tarhaQty: stockIn.tarhaQty,
  deductionAmount: stockIn.deductionAmount ?? computeStockInPricing(stockIn.qty, stockIn.originalPrice, stockIn.tarhaQty).deductionAmount,
  tarhaReason: stockIn.tarhaReason,
  purpose: stockIn.purpose,
  date: stockIn.date,
  remarks: stockIn.remarks,
});

function StockInTable({ title, description, emptyTitle, showEmptyTarhaLabel = true, stockIns, productsById, suppliersById, onEdit }: StockInTableProps) {
  return (
    <SectionCard title={title} description={description}>
      {stockIns.length > 0 ? (
        <div className="divide-y">
          {stockIns.map((stockIn) => {
            const supplier = suppliersById.get(stockIn.supplierId);

            return (
              <StockInSummaryRow
                key={stockIn.id}
                stockIn={stockIn}
                product={productsById.get(stockIn.productId)}
                supplierName={supplier?.name ?? "Unassigned"}
                showEmptyTarhaLabel={showEmptyTarhaLabel}
                onEdit={onEdit}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState title={emptyTitle} description="New records will appear here after you save stock-in transactions." />
      )}
    </SectionCard>
  );
}

export function StockInList() {
  const stockIns = useStockIn();
  const products = useProducts();
  const suppliers = useSuppliers();
  const mutations = useStockInMutations();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FirestoreDoc<StockIn> | null>(null);

  const productsById = useMemo(() => new Map((products.data ?? []).map((product) => [product.id, product])), [products.data]);
  const suppliersById = useMemo(() => new Map((suppliers.data ?? []).map((supplier) => [supplier.id, supplier])), [suppliers.data]);
  const editingInitialValues = useMemo(() => editing ? toStockInFormValues(editing) : null, [editing]);
  const groupedStockIns = useMemo(() => {
    const farmInput: FirestoreDoc<StockIn>[] = [];
    const vegetable: FirestoreDoc<StockIn>[] = [];

    (stockIns.data ?? []).forEach((stockIn) => {
      const product = productsById.get(stockIn.productId);
      const supplier = suppliersById.get(stockIn.supplierId);
      const hasAssignedSupplier = stockIn.supplierId.trim().length > 0 && supplier !== undefined;
      const supplierKind = supplier?.supplierKind ?? "vegetable";
      const productIsFarmInput = product ? FARM_INPUT_TYPES.some((type) => type === product.type) : false;
      const usesFarmInputFormat = supplierKind === "farmInput" || (productIsFarmInput && (!hasAssignedSupplier || supplierKind === "both"));

      if (usesFarmInputFormat) {
        farmInput.push(stockIn);
        return;
      }

      vegetable.push(stockIn);
    });

    return { farmInput, vegetable };
  }, [productsById, stockIns.data, suppliersById]);

  const submit = (values: StockInFormValues) => {
    if (editing) {
      mutations.updateStockIn.mutate({ id: editing.id, payload: values }, { onSuccess: () => setFormOpen(false) });
      return;
    }

    mutations.createStockIn.mutate(values, { onSuccess: () => setFormOpen(false) });
  };

  if (stockIns.isLoading || products.isLoading || suppliers.isLoading) return <LoadingSpinner />;

  return (
    <PageWrapper
      title="Stock In"
      description="Record incoming produce and farm inputs with Tarha quantity deductions."
      action={<Button onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="h-4 w-4" />Record Stock-In</Button>}
    >
      <StockInTable
        title="Farm Input Supplier Stock-In"
        description="Incoming abuno, fertilizer, medicine, green solution, and seed supplies."
        emptyTitle="No farm input stock-in yet"
        showEmptyTarhaLabel={false}
        stockIns={groupedStockIns.farmInput}
        productsById={productsById}
        suppliersById={suppliersById}
        onEdit={(stockIn) => { setEditing(stockIn); setFormOpen(true); }}
      />
      <StockInTable
        title="Vegetable Supplier Stock-In"
        description="Incoming vegetables and produce records with Tarha deductions."
        emptyTitle="No vegetable stock-in yet"
        stockIns={groupedStockIns.vegetable}
        productsById={productsById}
        suppliersById={suppliersById}
        onEdit={(stockIn) => { setEditing(stockIn); setFormOpen(true); }}
      />
      <StockInForm
        open={formOpen}
        initialValues={editingInitialValues}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        onSubmit={submit}
        pending={mutations.createStockIn.isPending || mutations.updateStockIn.isPending}
      />
    </PageWrapper>
  );
}
