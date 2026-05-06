import { StatusBadge } from "@/components/common/StatusBadge";
import { SectionCard } from "@/components/common/SectionCard";
import type { Crop } from "@/features/crop-monitoring/types/crop.types";
import { daysBetween, formatDate, todayISO } from "@/lib/utils";
import type { FirestoreDoc } from "@/types/global.types";

type UpcomingHarvestTimelineProps = {
  crops: FirestoreDoc<Crop>[];
};

export function UpcomingHarvestTimeline({ crops }: UpcomingHarvestTimelineProps) {
  return (
    <SectionCard title="Upcoming Harvest Timeline">
      <div className="space-y-4">
        {crops.map((crop) => {
          const days = daysBetween(todayISO(), crop.forecastHarvest);
          return (
            <div key={crop.id} className="border-l-2 border-leaf-300 pl-4">
              <p className="text-xs text-muted-foreground">{formatDate(crop.forecastHarvest)} · {days} days</p>
              <div className="mt-1 flex items-center gap-2">
                <p className="font-medium">{crop.name}</p>
                <StatusBadge status={crop.status} />
              </div>
              <p className="text-sm text-muted-foreground">Planted {formatDate(crop.plantingDate)} · {crop.qty} {crop.qtyUnit ?? "pcs"}</p>
            </div>
          );
        })}
        {crops.length === 0 ? <p className="text-sm text-muted-foreground">No upcoming harvests.</p> : null}
      </div>
    </SectionCard>
  );
}
