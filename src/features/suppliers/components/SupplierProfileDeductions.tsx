import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, HandCoins, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SupplierDeductionFormFields } from "@/features/suppliers/components/SupplierDeductionFormFields";
import { buildSupplierDeductionPayload, isSupplierInputDeductionType } from "@/features/suppliers/lib/supplierDeductionUtils";
import { supplierDeductionSchema } from "@/features/suppliers/schemas/supplier-deduction.schema";
import type { SupplierDeduction, SupplierDeductionFormValues } from "@/features/suppliers/types/supplier-deduction.types";
import { SUPPLIER_DEDUCTION_STATUS_LABELS, SUPPLIER_DEDUCTION_TYPE_LABELS, SUPPLIER_DEDUCTION_TYPES } from "@/lib/constants";
import { formatCurrency, formatDate, todayISO } from "@/lib/utils";
import type { FirestoreDoc } from "@/types/global.types";
import { useSupplierDeductionMutations } from "../hooks/useSupplierDeductionMutations";

type SupplierProfileDeductionsProps = {
  supplierId: string;
  deductions: FirestoreDoc<SupplierDeduction>[];
  openTotal: number;
  settledTotal: number;
};

const makeDefaults = (supplierId: string): SupplierDeductionFormValues => ({
  supplierId,
  type: "cashAdvance",
  amount: 0,
  inputProductId: "",
  inputProductName: "",
  inputQty: 0,
  inputUnit: "",
  inputUnitPrice: 0,
  date: todayISO(),
  status: "open",
  remarks: "",
});

export function SupplierProfileDeductions({
  supplierId,
  deductions,
  openTotal,
  settledTotal,
}: SupplierProfileDeductionsProps) {
  const mutations = useSupplierDeductionMutations();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FirestoreDoc<SupplierDeduction> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const defaults = useMemo(() => makeDefaults(supplierId), [supplierId]);
  const form = useForm<SupplierDeductionFormValues>({
    resolver: zodResolver(supplierDeductionSchema),
    defaultValues: defaults,
  });
  const pending = mutations.createDeduction.isPending || mutations.updateDeduction.isPending || mutations.settleDeduction.isPending;
  const deductionTypeSummary = useMemo(
    () => SUPPLIER_DEDUCTION_TYPES
      .map((type) => {
        const records = deductions.filter((deduction) => deduction.type === type);

        return {
          type,
          count: records.length,
          total: records.reduce((sum, deduction) => sum + deduction.amount, 0),
        };
      })
      .filter((item) => item.count > 0),
    [deductions],
  );

  const settleDeduction = (deduction: FirestoreDoc<SupplierDeduction>) => {
    mutations.settleDeduction.mutate(deduction.id);
  };

  useEffect(() => {
    form.reset(editing ? {
      supplierId: editing.supplierId,
      type: editing.type,
      amount: editing.amount,
      inputProductId: editing.inputProductId ?? "",
      inputProductName: editing.inputProductName ?? "",
      inputQty: editing.inputQty ?? 0,
      inputUnit: editing.inputUnit ?? "",
      inputUnitPrice: editing.inputUnitPrice ?? 0,
      date: editing.date,
      status: editing.status,
      remarks: editing.remarks,
    } : defaults);
  }, [defaults, editing, form, open]);

  const submit = form.handleSubmit((values) => {
    const payload = buildSupplierDeductionPayload(values);

    if (editing) {
      mutations.updateDeduction.mutate({ id: editing.id, payload }, { onSuccess: () => setOpen(false) });
      return;
    }

    mutations.createDeduction.mutate(payload, { onSuccess: () => setOpen(false) });
  });

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-serif text-xl">Supplier Deductions</h3>
          <p className="text-sm text-muted-foreground">Cash advances, farm input deductions, and other deductions connected to this supplier.</p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add deduction
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <SummaryBox label="Open deductions" value={formatCurrency(openTotal)} />
        <SummaryBox label="Settled deductions" value={formatCurrency(settledTotal)} />
      </div>
      {deductionTypeSummary.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {deductionTypeSummary.map((item) => (
            <SummaryBox
              key={item.type}
              label={`${SUPPLIER_DEDUCTION_TYPE_LABELS[item.type]} (${item.count})`}
              value={formatCurrency(item.total)}
            />
          ))}
        </div>
      ) : null}
      {deductions.length > 0 ? (
        <div className="space-y-2">
          {deductions.map((deduction) => (
            <article key={deduction.id} className="rounded-md border bg-card p-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <HandCoins className="h-4 w-4 text-leaf-700" />
                    <p className="font-medium">{SUPPLIER_DEDUCTION_TYPE_LABELS[deduction.type]}</p>
                    <StatusBadge status={deduction.status} label={SUPPLIER_DEDUCTION_STATUS_LABELS[deduction.status]} />
                  </div>
                  {isSupplierInputDeductionType(deduction.type) ? (
                    <p className="text-sm text-muted-foreground">
                      {deduction.inputProductName || "Input product"} · {deduction.inputQty ?? 0} {deduction.inputUnit || "unit"} x {formatCurrency(deduction.inputUnitPrice ?? 0)}
                    </p>
                  ) : null}
                  <p className="text-sm text-muted-foreground">{formatDate(deduction.date)}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <p className="text-sm text-muted-foreground">{deduction.remarks || "—"}</p>
                    {deduction.status === "open" ? (
                      <Button type="button" variant="outline" size="sm" onClick={() => settleDeduction(deduction)} disabled={mutations.settleDeduction.isPending}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Settle
                      </Button>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <p className="mr-2 font-semibold text-red-700">{formatCurrency(deduction.amount)}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(deduction);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button type="button" variant="destructive" size="sm" onClick={() => setDeleteId(deduction.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                    Del
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No supplier deductions recorded yet.</p>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Deduction" : "Add Deduction"}</DialogTitle>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={submit}>
            <SupplierDeductionFormFields form={form} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
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
    </section>
  );
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
