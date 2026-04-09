import { useQuery } from '@tanstack/react-query';
import { getMyStudentAttendance } from '@/services/attendance.api';

export const useGetMyAttendance = (options = {}) => {
  return useQuery({
    queryKey: ['student-attendance', 'me'],
    queryFn: getMyStudentAttendance,
    enabled: options.enabled ?? true,
  });
};
