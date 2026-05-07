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
      return normalizeSearch(`${supplier.name} ${supplier.contactPerson} ${supplier.address}`).includes(term);
    });
  }, [search, suppliers.data]);

  const submit = (values: SupplierFormValues) => {
    if (editing) mutations.updateSupplier.mutate({ id: editing.id, payload: values }, { onSuccess: () => setFormOpen(false) });
    else mutations.createSupplier.mutate(values, { onSuccess: () => setFormOpen(false) });
  };

  if (suppliers.isLoading) return <LoadingSpinner />;

  return (
    <PageWrapper
      title="Suppliers"
      description="Manage vegetable supplier profiles, deductions, and linked inventory."
      action={<Button onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="h-4 w-4" />Add Supplier</Button>}
    >
      <Input placeholder="Search suppliers..." value={search} onChange={(event) => setSearch(event.target.value)} className="w-full max-w-md" />
      <div className="grid gap-6">
        <SectionCard
          title="Vegetable Suppliers"
          description={`${rows.length} ${rows.length === 1 ? "supplier" : "suppliers"}`}
        >
          <SupplierProfileList
            suppliers={rows}
            emptyMessage="No vegetable suppliers found."
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
