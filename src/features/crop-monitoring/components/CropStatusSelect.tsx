import { CROP_STATUS_LABELS, CROP_STATUSES } from "@/lib/constants";
import type { CropStatus } from "@/features/crop-monitoring/types/crop.types";

type CropStatusSelectProps = {
  value: CropStatus;
  onChange: (value: CropStatus) => void;
  disabled?: boolean;
};

export function CropStatusSelect({ value, onChange, disabled = false }: CropStatusSelectProps) {
  return (
    <select
      className="flex h-9 w-40 rounded-md border border-input bg-background px-3 text-sm"
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as CropStatus)}
    >
      {CROP_STATUSES.map((status) => <option key={status} value={status}>{CROP_STATUS_LABELS[status]}</option>)}
    </select>
  );
}
