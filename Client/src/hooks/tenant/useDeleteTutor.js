import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTutorApi } from "@/services/tenant.api";

export const useDeleteTutor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTutorApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-tutors"] });
    },
  });
};