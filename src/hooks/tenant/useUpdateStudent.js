import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateStudentApi } from "@/services/tenant.api";

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId, data }) => updateStudentApi(studentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-students"] });
    },
  });
};
