import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ReportDateRangeFilterProps = {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
};

export function ReportDateRangeFilter({ from, to, onFromChange, onToChange }: ReportDateRangeFilterProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-2">
        <Label>From</Label>
        <Input type="date" value={from} onChange={(event) => onFromChange(event.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>To</Label>
        <Input type="date" value={to} onChange={(event) => onToChange(event.target.value)} />
      </div>
    </div>
  );
}
