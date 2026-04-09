import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBatchApi } from "@/services/tenant.api";

export const useUpdateBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ batchId, data }) => updateBatchApi(batchId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-batches"] });
    },
  });
};
