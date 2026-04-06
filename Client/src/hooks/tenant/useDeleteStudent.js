import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteStudentApi } from "@/services/tenant.api";

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStudentApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-students"] });
    },
  });
};
