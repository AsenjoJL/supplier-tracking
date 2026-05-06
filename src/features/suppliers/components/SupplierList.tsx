import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { SectionCard } from "@/components/common/SectionCard";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SupplierDetailDrawer } from "@/features/suppliers/components/SupplierDetailDrawer";
import { SupplierForm } from "@/features/suppliers/components/SupplierForm";
import { SupplierProfileList } from "@/features/suppliers/components/SupplierProfileList";
import { useSupplierMutations } from "@/features/suppliers/hooks/useSupplierMutations";
import { useSuppliers } from "@/features/suppliers/hooks/useSuppliers";
import type { Supplier, SupplierFormValues } from "@/features/suppliers/types/supplier.types";
import { SUPPLIER_KIND_LABELS } from "@/lib/constants";
import { normalizeSearch } from "@/lib/utils";
import type { FirestoreDoc } from "@/types/global.types";

export function SupplierList() {
  const suppliers = useSuppliers();
  const mutations = useSupplierMutations();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<FirestoreDoc<Supplier> | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const term = normalizeSearch(search);
    return (suppliers.data ?? []).filter((supplier) => {
      const kindLabel = SUPPLIER_KIND_LABELS[supplier.supplierKind ?? "vegetable"];
      return normalizeSearch(`${supplier.name} ${supplier.contactPerson} ${supplier.address} ${kindLabel}`).includes(term);
    });
  }, [search, suppliers.data]);
  const vegetableSuppliers = useMemo(
    () => rows.filter((supplier) => (supplier.supplierKind ?? "vegetable") === "vegetable"),
    [rows],
  );
  const farmInputSuppliers = useMemo(
    () => rows.filter((supplier) => (supplier.supplierKind ?? "vegetable") !== "vegetable"),
    [rows],
  );

  const submit = (values: SupplierFormValues) => {
    if (editing) mutations.updateSupplier.mutate({ id: editing.id, payload: values }, { onSuccess: () => setFormOpen(false) });
    else mutations.createSupplier.mutate(values, { onSuccess: () => setFormOpen(false) });
  };

  if (suppliers.isLoading) return <LoadingSpinner />;

  return (
    <PageWrapper
      title="Suppliers"
      description="Manage grower partners, agri suppliers, and their linked inventory."
      action={<Button onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="h-4 w-4" />Add Supplier</Button>}
    >
      <Input placeholder="Search suppliers..." value={search} onChange={(event) => setSearch(event.target.value)} className="w-full max-w-md" />
      <div className="grid gap-6 2xl:grid-cols-2">
        <SectionCard
          title="Vegetable Suppliers"
          description={`${vegetableSuppliers.length} ${vegetableSuppliers.length === 1 ? "supplier" : "suppliers"}`}
        >
          <SupplierProfileList
            suppliers={vegetableSuppliers}
            emptyMessage="No vegetable suppliers found."
            onView={setDetailId}
            onEdit={(supplier) => { setEditing(supplier); setFormOpen(true); }}
            onDelete={setDeleteId}
          />
        </SectionCard>
        <SectionCard
          title="Farm Input & Other Suppliers"
          description={`${farmInputSuppliers.length} ${farmInputSuppliers.length === 1 ? "supplier" : "suppliers"} for abuno, fertilizer, medicine, green solution, seeds, and mixed supply.`}
        >
          <SupplierProfileList
            suppliers={farmInputSuppliers}
            emptyMessage="No farm input or other suppliers found."
            onView={setDetailId}
            onEdit={(supplier) => { setEditing(supplier); setFormOpen(true); }}
            onDelete={setDeleteId}
          />
        </SectionCard>
      </div>
      <SupplierForm open={formOpen} supplier={editing} onOpenChange={setFormOpen} onSubmit={submit} pending={mutations.createSupplier.isPending || mutations.updateSupplier.isPending} />
      <SupplierDetailDrawer supplierId={detailId} open={detailId !== null} onOpenChange={(open) => { if (!open) setDetailId(null); }} />
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete supplier?"
        description="This removes the supplier record. Linked products are not deleted automatically."
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        onConfirm={() => deleteId && mutations.deleteSupplier.mutate(deleteId, { onSuccess: () => setDeleteId(null) })}
        pending={mutations.deleteSupplier.isPending}
      />
    </PageWrapper>
  );
}
