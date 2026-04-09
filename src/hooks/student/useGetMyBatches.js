import { useQuery } from "@tanstack/react-query";
import { getStudentBatchesApi } from "@/services/student.api";

export const useGetMyBatches = () => {
  return useQuery({
    queryKey: ["student-batches"],
    queryFn: async () => {
      const { data } = await getStudentBatchesApi();
      return data;
    },
  });
};
