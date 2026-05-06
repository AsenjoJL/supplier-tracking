import { SectionCard } from "@/components/common/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TARHA_REASON_LABELS, TARHA_REASONS } from "@/lib/constants";

export function TarhaReasonGuide() {
  return (
    <SectionCard title="Tarha Reason Guide" description="Reference list for quality deductions.">
      <div className="space-y-2">
        {TARHA_REASONS.map((reason) => (
          <div key={reason} className="flex items-center justify-between rounded-md border bg-background p-3">
            <span>{TARHA_REASON_LABELS[reason]}</span>
            <StatusBadge status={reason} />
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
        Final Price = (Original Quantity - Tarha Quantity) x Unit Price
      </p>
    </SectionCard>
  );
}
