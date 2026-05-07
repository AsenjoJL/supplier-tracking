import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TARHA_PERCENT_OPTIONS, TARHA_REASON_LABELS, TARHA_REASONS } from "@/lib/constants";
import { computeStockInPricing, formatCurrency } from "@/lib/utils";
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
  const pricing = computeStockInPricing(qty, unitPrice, tarhaQty);

  useEffect(() => {
    const nextPricing = computeStockInPricing(qty, unitPrice, tarhaQty);

    if (Math.abs(nextPricing.tarhaQty - tarhaQty) > 0.001) {
      form.setValue("tarhaQty", nextPricing.tarhaQty, { shouldDirty: true, shouldValidate: true });
    }

    if (Math.abs(nextPricing.tarhaPercent - tarhaPercent) > 0.001) {
      form.setValue("tarhaPercent", nextPricing.tarhaPercent, { shouldDirty: true, shouldValidate: true });
    }

    if (Math.abs(nextPricing.deductionAmount - deductionAmount) > 0.001) {
      form.setValue("deductionAmount", nextPricing.deductionAmount, { shouldDirty: true, shouldValidate: true });
    }

    if (nextPricing.tarhaQty === 0 && form.getValues("tarhaReason") !== null) {
      form.setValue("tarhaReason", null, { shouldDirty: true, shouldValidate: true });
    }
  }, [deductionAmount, form, qty, tarhaPercent, tarhaQty, unitPrice]);

  return (
    <div className="rounded-md border bg-muted/30 p-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="tarhaQty">Tarha quantity ({form.watch("unit") || "unit"})</Label>
          <Input
            id="tarhaQty"
            type="number"
            min="0"
            max={qty || undefined}
            step="0.01"
            value={String(tarhaQty)}
            onChange={(event) => {
              const nextPricing = computeStockInPricing(qty, unitPrice, Number(event.target.value) || 0);
              form.setValue("tarhaQty", nextPricing.tarhaQty, { shouldDirty: true, shouldValidate: true });
              form.setValue("tarhaPercent", nextPricing.tarhaPercent, { shouldDirty: true, shouldValidate: true });
              form.setValue("deductionAmount", nextPricing.deductionAmount, { shouldDirty: true, shouldValidate: true });
            }}
          />
          <p className="text-xs text-muted-foreground">This is deducted from received kilos/quantity, not from unit price.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tarhaPercent">Tarha Percent</Label>
          <select
            id="tarhaPercent"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={String(tarhaPercent)}
            onChange={(event) => {
              const nextPercent = Number(event.target.value);
              const nextPricing = computeStockInPricing(qty, unitPrice, (qty * nextPercent) / 100);
              form.setValue("tarhaPercent", nextPricing.tarhaPercent, { shouldDirty: true, shouldValidate: true });
              form.setValue("tarhaQty", nextPricing.tarhaQty, { shouldDirty: true, shouldValidate: true });
              form.setValue("deductionAmount", nextPricing.deductionAmount, { shouldDirty: true, shouldValidate: true });
            }}
          >
            {TARHA_PERCENT_OPTIONS.map((percent) => (
              <option key={percent} value={percent}>{percent}%</option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">Shortcut only. Kilo quantity is saved.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tarhaReason">Tarha reason</Label>
          <select
            id="tarhaReason"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            disabled={pricing.tarhaQty === 0}
            value={form.watch("tarhaReason") ?? ""}
            onChange={(event) => form.setValue("tarhaReason", event.target.value === "" ? null : event.target.value as StockInFormValues["tarhaReason"])}
          >
            <option value="">None</option>
            {TARHA_REASONS.map((reason) => <option key={reason} value={reason}>{TARHA_REASON_LABELS[reason]}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-4 space-y-2 rounded-md bg-background p-3 text-sm">
        <p>
          Net quantity = received quantity minus Tarha ={" "}
          <span className="font-semibold text-leaf-700">{pricing.netQty} {form.watch("unit") || "unit"}</span>
        </p>
        <p>
          Final price = net quantity x {formatCurrency(unitPrice)} ={" "}
          <span className="font-semibold text-leaf-700">{formatCurrency(pricing.finalPrice)}</span>
        </p>
        <p className="text-xs text-muted-foreground">Tarha is deducted from quantity before pricing.</p>
      </div>
    </div>
  );
}
