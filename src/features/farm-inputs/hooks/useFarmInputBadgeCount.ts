import { useMemo } from "react";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { useFarmInputs } from "./useFarmInputs";

export function useFarmInputBadgeCount() {
  const farmInputs = useFarmInputs();
  return useMemo(
    () => farmInputs.rows.filter((row) => row.currentStock <= LOW_STOCK_THRESHOLD).length,
    [farmInputs.rows],
  );
}
