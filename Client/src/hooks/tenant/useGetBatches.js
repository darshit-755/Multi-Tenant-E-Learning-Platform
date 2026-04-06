import { useQuery } from "@tanstack/react-query";
import { getTenantBatchesApi } from "@/services/tenant.api";

export const useGetBatches = () => {
  return useQuery({
    queryKey: ["tenant-batches"],
    queryFn: async () => {
      const { data } = await getTenantBatchesApi();
      return data;
    },
  });
};
