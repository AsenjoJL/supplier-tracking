import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { StockIn, TarhaReason } from "@/features/stock-in/types/stock-in.types";
import { useTarhaQuickApply } from "@/features/open-listing/hooks/useTarhaQuickApply";
import { TARHA_REASON_LABELS, TARHA_REASONS } from "@/lib/constants";
import { computeStockInPricing, formatCurrency } from "@/lib/utils";
import type { FirestoreDoc } from "@/types/global.types";

type TarhaQuickButtonProps = {
  stockIn: FirestoreDoc<StockIn> | null;
};

export function TarhaQuickButton({ stockIn }: TarhaQuickButtonProps) {
  const updateTarha = useTarhaQuickApply();
  const [open, setOpen] = useState(false);
  const [tarhaQty, setTarhaQty] = useState(stockIn?.tarhaQty ?? 0);
  const [reason, setReason] = useState<TarhaReason | null>(stockIn?.tarhaReason ?? null);

  if (!stockIn) return <span className="text-sm text-muted-foreground">No stock-in</span>;

  const pricing = computeStockInPricing(stockIn.qty, stockIn.originalPrice, tarhaQty);

  const submit = () => {
    updateTarha.mutate({ id: stockIn.id, stockIn, tarhaQty, tarhaReason: tarhaQty > 0 ? reason : null }, { onSuccess: () => setOpen(false) });
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => { setTarhaQty(stockIn.tarhaQty); setReason(stockIn.tarhaReason); setOpen(true); }}>
        {stockIn.tarhaQty > 0 ? "Edit Tarha" : "Apply Tarha"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Tarha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tarha quantity</Label>
              <Input type="number" value={tarhaQty} onChange={(event) => setTarhaQty(Number(event.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={reason ?? ""} onChange={(event) => setReason(event.target.value === "" ? null : event.target.value as TarhaReason)}>
                <option value="">None</option>
                {TARHA_REASONS.map((item) => <option key={item} value={item}>{TARHA_REASON_LABELS[item]}</option>)}
              </select>
            </div>
            <div className="rounded-md border bg-muted/30 p-3 text-sm">
              <div className="flex justify-between"><span>Original qty</span><span>{stockIn.qty} {stockIn.unit}</span></div>
              <div className="flex justify-between"><span>Tarha</span><StatusBadge status={reason ?? "ok"} label={`${pricing.tarhaQty} ${stockIn.unit}`} /></div>
              <div className="flex justify-between"><span>Net qty</span><span>{pricing.netQty} {stockIn.unit}</span></div>
              <div className="mt-2 flex justify-between border-t pt-2 font-semibold"><span>Final price</span><span>{formatCurrency(pricing.finalPrice)}</span></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={updateTarha.isPending || (tarhaQty > 0 && !reason)} onClick={submit}>{updateTarha.isPending ? "Saving..." : "Apply"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
