import { useQuery } from "@tanstack/react-query";
import { getStudentClassesApi } from "@/services/student.api";

export const useGetMyClasses = () => {
  return useQuery({
    queryKey: ["student-classes"],
    queryFn: async () => {
      const { data } = await getStudentClassesApi();
      return data;
    },
  });
};
