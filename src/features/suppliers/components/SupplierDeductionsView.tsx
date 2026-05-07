import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, HandCoins, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { SectionCard } from "@/components/common/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supplierDeductionSchema } from "@/features/suppliers/schemas/supplier-deduction.schema";
import type { SupplierDeduction, SupplierDeductionFormValues } from "@/features/suppliers/types/supplier-deduction.types";
import type { Supplier } from "@/features/suppliers/types/supplier.types";
import {
  SUPPLIER_DEDUCTION_STATUS_LABELS,
  SUPPLIER_DEDUCTION_TYPE_LABELS,
  SUPPLIER_DEDUCTION_TYPES,
} from "@/lib/constants";
import { formatCurrency, formatDate, todayISO } from "@/lib/utils";
import type { FirestoreDoc } from "@/types/global.types";
import { useSupplierDeductionMutations } from "../hooks/useSupplierDeductionMutations";
import { useSupplierDeductions } from "../hooks/useSupplierDeductions";
import { useSuppliers } from "../hooks/useSuppliers";

type DeductionRow = FirestoreDoc<SupplierDeduction> & {
  supplierName: string;
};

const defaults: SupplierDeductionFormValues = {
  supplierId: "",
  type: "cashAdvance",
  amount: 0,
  date: todayISO(),
  status: "open",
  remarks: "",
};

export function SupplierDeductionsView() {
  const deductions = useSupplierDeductions();
  const suppliers = useSuppliers();
  const mutations = useSupplierDeductionMutations();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FirestoreDoc<SupplierDeduction> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const form = useForm<SupplierDeductionFormValues>({
    resolver: zodResolver(supplierDeductionSchema),
    defaultValues: defaults,
  });
  const supplierById = useMemo(
    () => new Map((suppliers.data ?? []).map((supplier): [string, FirestoreDoc<Supplier>] => [supplier.id, supplier])),
    [suppliers.data],
  );
  const rows = useMemo<DeductionRow[]>(
    () => (deductions.data ?? []).map((deduction) => ({
      ...deduction,
      supplierName: supplierById.get(deduction.supplierId)?.name ?? "Unknown supplier",
    })),
    [deductions.data, supplierById],
  );
  const openTotal = rows.filter((row) => row.status === "open").reduce((sum, row) => sum + row.amount, 0);
  const settledTotal = rows.filter((row) => row.status === "settled").reduce((sum, row) => sum + row.amount, 0);
  const pending = mutations.createDeduction.isPending || mutations.updateDeduction.isPending || mutations.settleDeduction.isPending;

  const settleDeduction = (deduction: FirestoreDoc<SupplierDeduction>) => {
    mutations.settleDeduction.mutate(deduction.id);
  };

  const openForm = (deduction: FirestoreDoc<SupplierDeduction> | null) => {
    setEditing(deduction);
    form.reset(deduction ? {
      supplierId: deduction.supplierId,
      type: deduction.type,
      amount: deduction.amount,
      date: deduction.date,
      status: deduction.status,
      remarks: deduction.remarks,
    } : {
      ...defaults,
      supplierId: suppliers.data?.[0]?.id ?? "",
    });
    setFormOpen(true);
  };

  const columns: DataTableColumn<DeductionRow>[] = [
    { id: "supplier", header: "Supplier", sortable: true, sortValue: (row) => row.supplierName, cell: (row) => <p className="font-medium">{row.supplierName}</p> },
    { id: "type", header: "Type", cell: (row) => SUPPLIER_DEDUCTION_TYPE_LABELS[row.type] },
    { id: "date", header: "Date", sortable: true, sortValue: (row) => row.date, cell: (row) => formatDate(row.date) },
    { id: "amount", header: "Amount", sortable: true, sortValue: (row) => row.amount, cell: (row) => <span className="font-semibold text-red-700">{formatCurrency(row.amount)}</span> },
    { id: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} label={SUPPLIER_DEDUCTION_STATUS_LABELS[row.status]} /> },
    {
      id: "remarks",
      header: "Remarks",
      cell: (row) => (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">{row.remarks || "—"}</span>
          {row.status === "open" ? (
            <Button variant="outline" size="sm" onClick={() => settleDeduction(row)} disabled={mutations.settleDeduction.isPending}>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Settle
            </Button>
          ) : null}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (row) => (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => openForm(row)}><Pencil className="h-3.5 w-3.5" />Edit</Button>
          <Button variant="destructive" size="sm" onClick={() => setDeleteId(row.id)}><Trash2 className="h-3.5 w-3.5" />Del</Button>
        </div>
      ),
    },
  ];

  const submit = form.handleSubmit((values) => {
    if (editing) {
      mutations.updateDeduction.mutate({ id: editing.id, payload: values }, { onSuccess: () => setFormOpen(false) });
      return;
    }

    mutations.createDeduction.mutate(values, { onSuccess: () => setFormOpen(false) });
  });

  if (deductions.isLoading || suppliers.isLoading) return <LoadingSpinner />;

  return (
    <PageWrapper
      title="Deductions"
      description="Track supplier cash advances, loans, farm input deductions, transport, packaging, and other deductions."
      action={<Button onClick={() => openForm(null)}><Plus className="h-4 w-4" />Add Deduction</Button>}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard title="Open Deductions">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-red-50 text-red-700">
              <HandCoins className="h-5 w-5" />
            </div>
            <p className="font-serif text-2xl">{formatCurrency(openTotal)}</p>
          </div>
        </SectionCard>
        <SectionCard title="Settled Deductions">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-leaf-50 text-leaf-700">
              <HandCoins className="h-5 w-5" />
            </div>
            <p className="font-serif text-2xl">{formatCurrency(settledTotal)}</p>
          </div>
        </SectionCard>
      </div>
      <SectionCard title="Supplier Deductions" description={`${rows.length} ${rows.length === 1 ? "record" : "records"}`}>
        <DataTable data={rows} columns={columns} getRowId={(row) => row.id} emptyMessage="No deductions recorded yet." />
      </SectionCard>
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Deduction" : "Add Deduction"}</DialogTitle>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={submit}>
            <div className="space-y-2">
              <Label>Supplier</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("supplierId")}>
                <option value="">Select supplier</option>
                {(suppliers.data ?? []).map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
              {form.formState.errors.supplierId ? <p className="text-sm text-destructive">{form.formState.errors.supplierId.message}</p> : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Type</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("type")}>
                  {SUPPLIER_DEDUCTION_TYPES.map((type) => (
                    <option key={type} value={type}>{SUPPLIER_DEDUCTION_TYPE_LABELS[type]}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" {...form.register("date")} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input type="number" step="0.01" {...form.register("amount")} />
                {form.formState.errors.amount ? <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("status")}>
                  <option value="open">Open</option>
                  <option value="settled">Settled</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Remarks</Label>
              <Textarea {...form.register("remarks")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save deduction"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete deduction?"
        description="This removes the supplier deduction record."
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setDeleteId(null);
        }}
        onConfirm={() => deleteId && mutations.deleteDeduction.mutate(deleteId, { onSuccess: () => setDeleteId(null) })}
        pending={mutations.deleteDeduction.isPending}
      />
    </PageWrapper>
  );
}
