import { useQuery } from "@tanstack/react-query";
import { getProfileApi } from "@/services/student.api";

export const useGetProfile = () => {
  return useQuery({
    queryKey: ["student-profile"],
    queryFn: async () => {
      const { data } = await getProfileApi();
      return data;
    },
  });
};
