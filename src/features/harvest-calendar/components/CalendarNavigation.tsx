import { addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type CalendarNavigationProps = {
  monthLabel: string;
  monthDate: Date;
  onMonthChange: (date: Date) => void;
};

export function CalendarNavigation({ monthLabel, monthDate, onMonthChange }: CalendarNavigationProps) {
  return (
    <div className="flex w-full items-center justify-between gap-2 sm:w-auto">
      <Button variant="outline" size="icon" onClick={() => onMonthChange(subMonths(monthDate, 1))} aria-label="Previous month">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <h2 className="min-w-0 flex-1 text-center font-serif text-xl sm:min-w-44 sm:text-2xl">{monthLabel}</h2>
      <Button variant="outline" size="icon" onClick={() => onMonthChange(addMonths(monthDate, 1))} aria-label="Next month">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
