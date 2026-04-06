import { useQuery } from "@tanstack/react-query";
import { getTutorBatchesApi } from "@/services/batch.api";

export const useGetMyBatches = () => {
  return useQuery({
    queryKey: ["tutor-batches"],
    queryFn: async () => {
      const { data } = await getTutorBatchesApi();
      return data;
    },
  });
};
