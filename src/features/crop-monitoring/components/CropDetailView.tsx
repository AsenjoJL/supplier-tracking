import { StatusBadge } from "@/components/common/StatusBadge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Crop } from "@/features/crop-monitoring/types/crop.types";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useStockOut } from "@/features/stock-out/hooks/useStockOut";
import { useSuppliers } from "@/features/suppliers/hooks/useSuppliers";
import { formatDate } from "@/lib/utils";
import type { FirestoreDoc } from "@/types/global.types";

type CropDetailViewProps = {
  crop: FirestoreDoc<Crop> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CropDetailView({ crop, open, onOpenChange }: CropDetailViewProps) {
  const suppliers = useSuppliers();
  const stockOuts = useStockOut();
  const products = useProducts();
  const allocations = crop ? (stockOuts.data ?? []).filter((item) => item.cropId === crop.id) : [];
  const supplier = crop ? suppliers.data?.find((item) => item.id === crop.supplierId) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{crop?.name ?? "Crop details"}</DialogTitle>
          <DialogDescription>{supplier?.name ?? "Crop monitoring record"}</DialogDescription>
        </DialogHeader>
        {crop ? (
          <div className="mt-6 space-y-6">
            <div className="rounded-md border p-4 text-sm">
              <div className="flex flex-col gap-1 py-2 sm:flex-row sm:justify-between"><span className="text-muted-foreground">Planting date</span><span>{formatDate(crop.plantingDate)}</span></div>
              <div className="flex flex-col gap-1 py-2 sm:flex-row sm:justify-between"><span className="text-muted-foreground">Forecast harvest</span><span>{formatDate(crop.forecastHarvest)}</span></div>
              <div className="flex flex-col gap-1 py-2 sm:flex-row sm:justify-between"><span className="text-muted-foreground">Actual harvest</span><span>{formatDate(crop.actualHarvest)}</span></div>
              <div className="flex flex-col gap-1 py-2 sm:flex-row sm:justify-between"><span className="text-muted-foreground">Quantity</span><span>{crop.qty} {crop.qtyUnit ?? "pcs"}</span></div>
              <div className="flex flex-col gap-1 py-2 sm:flex-row sm:justify-between"><span className="text-muted-foreground">Status</span><StatusBadge status={crop.status} /></div>
            </div>
            <section>
              <h3 className="mb-3 text-lg">Allocated Inputs</h3>
              <div className="space-y-3">
                {allocations.map((allocation) => {
                  const product = products.data?.find((item) => item.id === allocation.productId);
                  return (
                    <div key={allocation.id} className="rounded-md border p-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                        <p className="font-medium">{product?.name ?? "Unknown input"}</p>
                        <StatusBadge status={allocation.purpose} />
                      </div>
                      <p className="text-sm text-muted-foreground">{formatDate(allocation.date)} · {allocation.qty} {allocation.unit}</p>
                      {allocation.remarks ? <p className="mt-1 text-sm">{allocation.remarks}</p> : null}
                    </div>
                  );
                })}
                {allocations.length === 0 ? <p className="text-sm text-muted-foreground">No inputs allocated yet.</p> : null}
              </div>
            </section>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
