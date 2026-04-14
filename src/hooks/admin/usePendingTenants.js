import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllTenantsApi,
  approveTenantApi,
  blockTenantApi,
  makeTenantInactiveApi
} from "@/services/admin.api";
import toast from "react-hot-toast";

export const usePendingTenants = (currentPage) => {
  const queryClient = useQueryClient();
  const limit = 10

 
  const { data, isLoading, isError } = useQuery({
    queryKey: ["all-tenants", currentPage],
    queryFn: () => getAllTenantsApi(currentPage, limit),
    keepPreviousData: true,
  });
  // console.log("API Response:", data);


  const approveMutation = useMutation({
    mutationFn: approveTenantApi,
    onSuccess: () => {
      toast.success("Tenant approved successfully");
      queryClient.invalidateQueries(["all-tenants"]);
      queryClient.invalidateQueries(["all-tenants", "inactive-count"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to approve tenant");
    },
  });
  const inactiveMutation = useMutation({
    mutationFn: makeTenantInactiveApi,
    onSuccess: () => {
      toast.success("Tenant marked as inactive successfully");
      queryClient.invalidateQueries(["all-tenants"]);
      queryClient.invalidateQueries(["all-tenants", "inactive-count"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to mark tenant as inactive");
    },
  });


  const blockMutation = useMutation({
    mutationFn: blockTenantApi,
    onSuccess: () => {
      toast.success("Tenant blocked successfully");
      queryClient.invalidateQueries(["all-tenants"]);
      queryClient.invalidateQueries(["all-tenants", "inactive-count"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to block tenant");
    },
  });

  const handleApprove = (tenantId) => {
    approveMutation.mutate(tenantId);
  };
  const handleInactive = (tenantId) => {
    inactiveMutation.mutate(tenantId);
  };

  const handleBlock = (tenantId) => {
    blockMutation.mutate(tenantId);
  };

  const isLoading_ = approveMutation.isPending || inactiveMutation.isPending || blockMutation.isPending;

  return {
    tenants: data?.data?.tenants || [],
    totalPages: data?.data?.totalPages || 1,
    currentPage: data?.data?.currentPage || 1,
    isLoading,
    isError,
    handleApprove,
    handleBlock,
    handleInactive,
    isActionLoading: isLoading_,
  };
};