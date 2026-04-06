import { useQuery } from "@tanstack/react-query";
import { getAllTutorsApi } from "@/services/admin.api";

export const useAllTutors = (currentPage) => {
  const limit = 10;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["all-tutors", currentPage],
    queryFn: () => getAllTutorsApi(currentPage, limit),
    keepPreviousData: true,
  });

  return {
    tutors: data?.data?.tutors || [],
    totalPages: data?.data?.totalPages || 1,
    currentPage: data?.data?.currentPage || 1,
    isLoading,
    isError,
  };
};