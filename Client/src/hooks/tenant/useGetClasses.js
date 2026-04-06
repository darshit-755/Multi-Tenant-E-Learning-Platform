import { useQuery } from "@tanstack/react-query";
import { getClassesApi } from "@/services/class.api";

export const useGetClasses = () => {
  return useQuery({
    queryKey: ["tenant-classes"],
    queryFn: async () => {
      const { data } = await getClassesApi();
      return data;
    },
  });
};
