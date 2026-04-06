import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateClassApi } from "@/services/class.api";

export const useUpdateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ classId, data }) => updateClassApi(classId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-classes"] });
    },
  });
};
