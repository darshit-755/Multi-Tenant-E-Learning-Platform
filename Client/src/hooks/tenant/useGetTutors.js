import { useQuery } from "@tanstack/react-query";
import { getTenantTutorsApi } from "@/services/tenant.api";

export const useGetTutors = () => {
  return useQuery({
    queryKey: ["tenant-tutors"],
    queryFn: async () => {
      const { data } = await getTenantTutorsApi();
      return data;
    },
  });
};