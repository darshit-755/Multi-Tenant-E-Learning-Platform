import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSubjectApi } from "@/services/tenant.api";

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ subjectId, data }) => updateSubjectApi(subjectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-subjects"] });
    },
  });
};
