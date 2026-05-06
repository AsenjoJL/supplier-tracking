import { Pencil } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import type { Crop } from "@/features/crop-monitoring/types/crop.types";
import { formatDate } from "@/lib/utils";
import type { FirestoreDoc } from "@/types/global.types";

type SupplierProfileCropsProps = {
  crops: FirestoreDoc<Crop>[];
  onEdit?: (crop: FirestoreDoc<Crop>) => void;
};

export function SupplierProfileCrops({ crops, onEdit }: SupplierProfileCropsProps) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="font-serif text-xl">Crop Monitoring</h3>
        <p className="text-sm text-muted-foreground">Planting records, harvest forecast, and current crop status.</p>
      </div>
      {crops.length > 0 ? (
        <div className="space-y-3">
          {crops.map((crop) => (
            <article key={crop.id} className="rounded-md border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{crop.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {crop.qty} {crop.qtyUnit ?? "pcs"} planted - {crop.daysToHarvest} days
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={crop.status} />
                  {onEdit ? (
                    <Button variant="outline" size="sm" onClick={() => onEdit(crop)}>
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  ) : null}
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
                <CropDate label="Planted" value={crop.plantingDate} />
                <CropDate label="Forecast" value={crop.forecastHarvest} />
                <CropDate label="Actual" value={crop.actualHarvest} />
              </div>
              {crop.remarks ? <p className="mt-3 rounded-md bg-muted/40 p-2 text-sm text-muted-foreground">{crop.remarks}</p> : null}
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No crop monitoring records yet.</p>
      )}
    </section>
  );
}

function CropDate({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-md bg-muted/40 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{formatDate(value)}</p>
    </div>
  );
}
