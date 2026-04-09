import { useQuery } from "@tanstack/react-query";
import { getTutorClassesApi } from "@/services/class.api";

export const useGetMyClasses = () => {
  return useQuery({
    queryKey: ["tutor-classes"],
    queryFn: async () => {
      const { data } = await getTutorClassesApi();
      return data;
    },
  });
};
