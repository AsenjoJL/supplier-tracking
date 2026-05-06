import { endOfMonth, format, getDay, startOfMonth } from "date-fns";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { SectionCard } from "@/components/common/SectionCard";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { cn, todayISO } from "@/lib/utils";
import { useHarvestCalendar } from "@/features/harvest-calendar/hooks/useHarvestCalendar";
import { CalendarNavigation } from "./CalendarNavigation";
import { CropStatusSummary } from "./CropStatusSummary";
import { UpcomingHarvestTimeline } from "./UpcomingHarvestTimeline";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function HarvestCalendar() {
  const calendar = useHarvestCalendar();
  const firstDay = getDay(startOfMonth(calendar.monthDate));
  const days = endOfMonth(calendar.monthDate).getDate();
  const cells = [
    ...Array.from({ length: firstDay }, (_, index) => ({ key: `blank-${index}`, date: null as string | null, day: null as number | null })),
    ...Array.from({ length: days }, (_, index) => {
      const day = index + 1;
      const date = format(new Date(calendar.monthDate.getFullYear(), calendar.monthDate.getMonth(), day), "yyyy-MM-dd");
      return { key: date, date, day };
    }),
  ];

  if (calendar.isLoading) return <LoadingSpinner />;

  return (
    <PageWrapper title="Harvest Calendar" description="Visualize planting events, forecast harvests, and crop timing.">
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <SectionCard title="Monthly Calendar" action={<CalendarNavigation monthDate={calendar.monthDate} monthLabel={calendar.monthLabel} onMonthChange={calendar.setMonthDate} />}>
          <div className="overflow-x-auto">
            <div className="grid min-w-[680px] grid-cols-7 gap-2">
              {weekDays.map((day) => <div key={day} className="text-center text-xs font-semibold uppercase text-muted-foreground">{day}</div>)}
              {cells.map((cell) => {
                const events = cell.date ? calendar.eventsByDate.get(cell.date) ?? [] : [];
                return (
                  <div key={cell.key} className={cn("min-h-24 rounded-md border bg-background p-2 sm:min-h-28", cell.date === todayISO() && "border-leaf-500 bg-leaf-50")}>
                    {cell.day ? <p className="mb-2 text-sm font-medium">{cell.day}</p> : null}
                    <div className="space-y-1">
                      {events.slice(0, 3).map((event) => (
                        <div key={`${event.type}-${event.cropId}`} className={cn("truncate rounded px-1.5 py-1 text-xs", event.type === "planted" ? "bg-sky-100 text-sky-800" : "bg-amber-100 text-amber-900")}>
                          {event.type === "planted" ? "Planted" : "Harvest"} · {event.label}
                        </div>
                      ))}
                      {events.length > 3 ? <p className="text-xs text-muted-foreground">+{events.length - 3} more</p> : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </SectionCard>
        <div className="space-y-6">
          <UpcomingHarvestTimeline crops={calendar.upcomingHarvest} />
          <CropStatusSummary rows={calendar.statusSummary} />
        </div>
      </div>
    </PageWrapper>
  );
}
