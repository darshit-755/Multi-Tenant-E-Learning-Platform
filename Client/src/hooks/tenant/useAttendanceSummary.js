import { useQuery } from '@tanstack/react-query';
import { getAttendanceSummary } from '@/services/attendance.api';

export const useGetAttendanceSummary = (batchId, options = {}) => {
  return useQuery({
    queryKey: ['attendance-summary', batchId],
    queryFn: () => getAttendanceSummary(batchId),
    enabled: Boolean(batchId) && (options.enabled ?? true),
  });
};
