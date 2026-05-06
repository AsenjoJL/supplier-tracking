import { useMemo, useState } from "react";
import { format } from "date-fns";
import { useCrops } from "@/features/crop-monitoring/hooks/useCrops";
import { todayISO } from "@/lib/utils";

export function useHarvestCalendar() {
  const now = new Date();
  const [monthDate, setMonthDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const crops = useCrops();

  const eventsByDate = useMemo(() => {
    const events = new Map<string, { type: "planted" | "harvest"; label: string; cropId: string }[]>();
    (crops.data ?? []).forEach((crop) => {
      const plantingEvents = events.get(crop.plantingDate) ?? [];
      plantingEvents.push({ type: "planted", label: crop.name, cropId: crop.id });
      events.set(crop.plantingDate, plantingEvents);

      const harvestDate = crop.actualHarvest ?? crop.forecastHarvest;
      const harvestEvents = events.get(harvestDate) ?? [];
      harvestEvents.push({ type: "harvest", label: crop.name, cropId: crop.id });
      events.set(harvestDate, harvestEvents);
    });
    return events;
  }, [crops.data]);

  const upcomingHarvest = useMemo(
    () => (crops.data ?? []).filter((crop) => crop.forecastHarvest >= todayISO() && !crop.actualHarvest).sort((a, b) => a.forecastHarvest.localeCompare(b.forecastHarvest)),
    [crops.data],
  );

  const statusSummary = useMemo(() => {
    return ["planted", "growing", "treated", "readyForHarvest"].map((status) => ({
      status,
      count: (crops.data ?? []).filter((crop) => crop.status === status).length,
    }));
  }, [crops.data]);

  return {
    monthDate,
    monthLabel: format(monthDate, "MMMM yyyy"),
    setMonthDate,
    eventsByDate,
    upcomingHarvest,
    statusSummary,
    isLoading: crops.isLoading,
  };
}
