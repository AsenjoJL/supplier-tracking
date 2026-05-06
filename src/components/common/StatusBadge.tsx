import { Badge } from "@/components/ui/badge";
import { CROP_STATUS_LABELS, PRODUCT_TYPE_LABELS, STOCK_OUT_PURPOSE_LABELS, TARHA_REASON_LABELS } from "@/lib/constants";
import type { BadgeProps } from "@/components/ui/badge";

const toneByStatus = (status: string): BadgeProps["variant"] => {
  if (["active", "growing", "ok", "readyForHarvest"].includes(status)) return "green";
  if (["inactive", "harvested", "other"].includes(status)) return "muted";
  if (["low", "planted", "treated", "overripe", "smallSize", "planting", "cropMaintenance"].includes(status)) return "amber";
  if (["out", "failed", "damaged", "rotten"].includes(status)) return "red";
  if (["fertilizer", "medicine", "greenSolution", "seeds", "sold", "transferred"].includes(status)) return "blue";
  return "secondary";
};

const labels: Record<string, string> = {
  ...PRODUCT_TYPE_LABELS,
  ...STOCK_OUT_PURPOSE_LABELS,
  ...TARHA_REASON_LABELS,
  ...CROP_STATUS_LABELS,
  active: "Active",
  inactive: "Inactive",
  low: "Low",
  out: "Out",
  ok: "OK",
};

type StatusBadgeProps = {
  status: string;
  label?: string;
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return <Badge variant={toneByStatus(status)}>{label ?? labels[status] ?? status}</Badge>;
}
