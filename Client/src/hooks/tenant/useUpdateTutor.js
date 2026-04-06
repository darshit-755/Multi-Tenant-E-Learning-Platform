import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTutorApi } from "@/services/tenant.api";

export const useUpdateTutor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tutorId, data }) => updateTutorApi(tutorId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-tutors"] });
    },
  });
};
