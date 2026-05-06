import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { TARHA_PERCENT_OPTIONS, TARHA_REASON_LABELS, TARHA_REASONS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { StockInFormValues } from "@/features/stock-in/types/stock-in.types";

type TarhaDeductionFieldProps = {
  form: UseFormReturn<StockInFormValues>;
};

export function TarhaDeductionField({ form }: TarhaDeductionFieldProps) {
  const qty = Number(form.watch("qty") || 0);
  const tarhaQty = Number(form.watch("tarhaQty") || 0);
  const tarhaPercent = Number(form.watch("tarhaPercent") || 0);
  const deductionAmount = Number(form.watch("deductionAmount") || 0);
  const unitPrice = Number(form.watch("originalPrice") || 0);
  const originalTotal = Number((qty * unitPrice).toFixed(2));
  const finalPrice = Number(Math.max(0, originalTotal - deductionAmount).toFixed(2));

  useEffect(() => {
    const nextTarhaQty = Number(((qty * tarhaPercent) / 100).toFixed(2));
    const nextDeductionAmount = Number((originalTotal * (tarhaPercent / 100)).toFixed(2));

    if (Math.abs(nextTarhaQty - tarhaQty) > 0.001) {
      form.setValue("tarhaQty", nextTarhaQty, { shouldDirty: true, shouldValidate: true });
    }

    if (Math.abs(nextDeductionAmount - deductionAmount) > 0.001) {
      form.setValue("deductionAmount", nextDeductionAmount, { shouldDirty: true, shouldValidate: true });
    }

    if (tarhaPercent === 0 && form.getValues("tarhaReason") !== null) {
      form.setValue("tarhaReason", null, { shouldDirty: true, shouldValidate: true });
    }
  }, [deductionAmount, form, originalTotal, qty, tarhaPercent, tarhaQty]);

  return (
    <div className="rounded-md border bg-muted/30 p-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="tarhaPercent">Tarha Percent</Label>
          <select
            id="tarhaPercent"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={String(tarhaPercent)}
            onChange={(event) => {
              form.setValue("tarhaPercent", Number(event.target.value), { shouldDirty: true, shouldValidate: true });
            }}
          >
            {TARHA_PERCENT_OPTIONS.map((percent) => (
              <option key={percent} value={percent}>{percent}%</option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">Tarha quantity: {tarhaQty || 0}</p>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="tarhaReason">Tarha reason</Label>
          <select
            id="tarhaReason"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            disabled={tarhaPercent === 0}
            value={form.watch("tarhaReason") ?? ""}
            onChange={(event) => form.setValue("tarhaReason", event.target.value === "" ? null : event.target.value as StockInFormValues["tarhaReason"])}
          >
            <option value="">None</option>
            {TARHA_REASONS.map((reason) => <option key={reason} value={reason}>{TARHA_REASON_LABELS[reason]}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-4 rounded-md bg-background p-3 text-sm">
        Original Price {formatCurrency(originalTotal)} - Deduction Amount {formatCurrency(deductionAmount)} ={" "}
        <span className="font-semibold text-leaf-700">Final Price {formatCurrency(finalPrice)}</span>
      </div>
    </div>
  );
}
