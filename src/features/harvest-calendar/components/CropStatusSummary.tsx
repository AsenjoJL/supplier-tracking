import { SectionCard } from "@/components/common/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { CROP_STATUS_LABELS } from "@/lib/constants";

type CropStatusSummaryProps = {
  rows: { status: string; count: number }[];
};

export function CropStatusSummary({ rows }: CropStatusSummaryProps) {
  return (
    <SectionCard title="Crop Status Summary">
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.status} className="flex items-center justify-between rounded-md border bg-background p-3">
            <StatusBadge status={row.status} label={CROP_STATUS_LABELS[row.status as keyof typeof CROP_STATUS_LABELS]} />
            <span className="font-semibold">{row.count} crops</span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
