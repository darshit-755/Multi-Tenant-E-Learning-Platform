import { useQuery } from "@tanstack/react-query";
import { getTenantSubjectsApi } from "@/services/tenant.api";

export const useGetSubjects = () => {
  return useQuery({
    queryKey: ["tenant-subjects"],
    queryFn: async () => {
      const { data } = await getTenantSubjectsApi();
      return data;
    },
  });
};
