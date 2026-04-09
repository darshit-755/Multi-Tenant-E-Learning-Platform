import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerStudentApi } from "@/services/tenant.api";

export const useRegisterStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerStudentApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-students"] });
    },
  });
};
