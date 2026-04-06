import { useQuery } from "@tanstack/react-query";
import { getAllStudentsApi } from "@/services/admin.api";

export const useAllStudents = (currentPage) => {
  const limit = 10;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["all-students", currentPage],
    queryFn: () => getAllStudentsApi(currentPage, limit),
    keepPreviousData: true,
  });

  return {
    students: data?.data?.students || [],
    totalPages: data?.data?.totalPages || 1,
    currentPage: data?.data?.currentPage || 1,
    isLoading,
    isError,
  };
};