import { useQuery } from "@tanstack/react-query";
import { getProfileApi } from "@/services/admin.api";

export const useGetProfile = () => {
  return useQuery({
    queryKey: ["admin-profile"],
    queryFn: async () => {
      const { data } = await getProfileApi();
      return data;
    },
  });
};
