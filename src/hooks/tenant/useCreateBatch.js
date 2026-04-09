import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBatchApi } from "@/services/tenant.api";

export const useCreateBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBatchApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-batches"] });
    },
  });
};
