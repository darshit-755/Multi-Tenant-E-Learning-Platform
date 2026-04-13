import { useQuery } from "@tanstack/react-query";
import { getAttendanceSummary } from "@/services/attendance.api";

export const useGetAttendanceSummary = (batchId, options = {}) => {
  const shouldEnable = Boolean(batchId) && (options.enabled ?? true);

  return useQuery({
    queryKey: ["attendance-summary", batchId],
    queryFn: () => getAttendanceSummary(batchId),
    enabled: shouldEnable,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: shouldEnable ? (options.refetchInterval ?? 10000) : false,
    refetchIntervalInBackground: true,
  });
};
