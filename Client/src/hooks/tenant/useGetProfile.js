import { useQuery } from "@tanstack/react-query";
import { getProfileApi } from "@/services/tenant.api";

export const useGetProfile = () => {
  return useQuery({
    queryKey: ["tenant-profile"],
    queryFn: async () => {
      const { data } = await getProfileApi();
      return data;
    },
  });
};
