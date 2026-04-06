import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerTutorApi } from "@/services/tenant.api";

export const useRegisterTutor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerTutorApi,
    onSuccess: () => {
      // Refetch tutors list automatically
      queryClient.invalidateQueries({ queryKey: ["tenant-tutors"] });
    },
  });
};