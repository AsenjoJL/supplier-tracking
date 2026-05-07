import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cropService } from "@/features/crop-monitoring/services/cropService";
import type { CropFormValues } from "@/features/crop-monitoring/types/crop.types";
import { queryKeys } from "@/lib/queryKeys";
import { withRateLimit } from "@/lib/rateLimit";
import { addDaysToISODate } from "@/lib/utils";

export function useCropMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.crops.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.metrics });
    void queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
  };

  const createCrop = useMutation({
    mutationFn: withRateLimit<CropFormValues, string>("crops:create", (payload) =>
      cropService.create({
        ...payload,
        forecastHarvest: addDaysToISODate(payload.plantingDate, payload.daysToHarvest),
      }),
    ),
    onSuccess: invalidate,
  });

  const updateCrop = useMutation({
    mutationFn: withRateLimit<{ id: string; payload: Partial<CropFormValues> }, void>("crops:update", ({ id, payload }) =>
      cropService.update(id, {
        ...payload,
        ...(payload.plantingDate && payload.daysToHarvest
          ? { forecastHarvest: addDaysToISODate(payload.plantingDate, payload.daysToHarvest) }
          : {}),
      }),
    ),
    onSuccess: invalidate,
  });

  const deleteCrop = useMutation({
    mutationFn: withRateLimit<string, void>("crops:delete", (id) => cropService.remove(id)),
    onSuccess: invalidate,
  });

  return { createCrop, updateCrop, deleteCrop };
}
