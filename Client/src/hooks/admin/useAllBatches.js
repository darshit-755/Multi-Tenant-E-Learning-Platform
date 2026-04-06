import { useQuery } from "@tanstack/react-query";
import { getAllBatchesApi } from "@/services/admin.api";

export const useAllBatches = (currentPage) => {
  const limit = 10;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["all-batches", currentPage],
    queryFn: () => getAllBatchesApi(currentPage, limit),
    keepPreviousData: true,
  });

  return {
    batches: data?.data?.batches || [],
    totalPages: data?.data?.totalPages || 1,
    currentPage: data?.data?.currentPage || 1,
    isLoading,
    isError,
  };
};