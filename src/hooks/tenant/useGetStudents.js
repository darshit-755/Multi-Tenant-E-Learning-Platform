import { useQuery } from "@tanstack/react-query";
import { getTenantStudentsApi } from "@/services/tenant.api";

export const useGetStudents = () => {
  return useQuery({
    queryKey: ["tenant-students"],
    queryFn: async () => {
      const { data } = await getTenantStudentsApi();
      return data;
    },
  });
};
