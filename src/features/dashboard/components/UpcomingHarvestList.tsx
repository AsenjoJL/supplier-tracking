import { EmptyState } from "@/components/common/EmptyState";
import { SectionCard } from "@/components/common/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Crop } from "@/features/crop-monitoring/types/crop.types";
import { daysBetween, formatDate, todayISO } from "@/lib/utils";
import type { FirestoreDoc } from "@/types/global.types";

type UpcomingHarvestListProps = {
  crops: FirestoreDoc<Crop>[];
};

export function UpcomingHarvestList({ crops }: UpcomingHarvestListProps) {
  return (
    <SectionCard title="Upcoming Harvests" description="Forecasted harvest windows by crop.">
      {crops.length === 0 ? (
        <EmptyState title="No upcoming harvests" />
      ) : (
        <div className="space-y-3">
          {crops.map((crop) => {
            const days = daysBetween(todayISO(), crop.forecastHarvest);
            return (
              <div key={crop.id} className="flex flex-col gap-3 border-b pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium">{crop.name}</p>
                  <p className="text-sm text-muted-foreground">Planted {formatDate(crop.plantingDate)} · {crop.qty} plants</p>
                </div>
                <div className="shrink-0 sm:text-right">
                  <p className="font-medium">{formatDate(crop.forecastHarvest)}</p>
                  <StatusBadge status={days <= 7 ? "out" : "low"} label={days <= 0 ? "Due" : `${days} days`} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
