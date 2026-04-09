import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSubjectApi } from "@/services/tenant.api";

export const useCreateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSubjectApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-subjects"] });
    },
  });
};
