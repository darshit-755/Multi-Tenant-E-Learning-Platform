import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAttendanceByClass, markAttendance } from '@/services/attendance.api';

export const useGetClassAttendance = (classId, options = {}) => {
  return useQuery({
    queryKey: ['class-attendance', classId],
    queryFn: () => getAttendanceByClass(classId),
    enabled: Boolean(classId) && (options.enabled ?? true),
  });
};

export const useMarkAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ classId, attendanceData }) => markAttendance(classId, attendanceData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['class-attendance', variables.classId] });
      queryClient.invalidateQueries({ queryKey: ['tutor-classes'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-summary'] });
    },
  });
};
