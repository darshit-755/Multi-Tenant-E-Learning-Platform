import { useQuery } from "@tanstack/react-query";
import { getProfileApi } from "@/services/tutor.api";

export const useGetProfile = () => {
  return useQuery({
    queryKey: ["tutor-profile"],
    queryFn: async () => {
      const { data } = await getProfileApi();
      return data;
    },
  });
};
