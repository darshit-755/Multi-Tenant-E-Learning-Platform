import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllTenantsApi,
  approveTenantApi,
  blockTenantApi,
  makeTenantInactiveApi,
  deleteTenantApi,
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
      toast.success("Center approved successfully");
      queryClient.invalidateQueries({ queryKey: ["all-tenants"] });
      queryClient.invalidateQueries({ queryKey: ["all-tenants", "inactive-count"] });
      queryClient.invalidateQueries({ queryKey: ["new-pending-tenants"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to approve center");
    },
  });
  const inactiveMutation = useMutation({
    mutationFn: makeTenantInactiveApi,
    onSuccess: () => {
      toast.success("Center marked as inactive successfully");
      queryClient.invalidateQueries({ queryKey: ["all-tenants"] });
      queryClient.invalidateQueries({ queryKey: ["all-tenants", "inactive-count"] });
      queryClient.invalidateQueries({ queryKey: ["new-pending-tenants"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to mark center as inactive");
    },
  });


  const blockMutation = useMutation({
    mutationFn: blockTenantApi,
    onSuccess: () => {
      toast.success("Center suspended successfully");
      queryClient.invalidateQueries({ queryKey: ["all-tenants"] });
      queryClient.invalidateQueries({ queryKey: ["all-tenants", "inactive-count"] });
      queryClient.invalidateQueries({ queryKey: ["new-pending-tenants"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to suspend center");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTenantApi,
    onSuccess: () => {
      toast.success("Center deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["all-tenants"] });
      queryClient.invalidateQueries({ queryKey: ["all-tenants", "inactive-count"] });
      queryClient.invalidateQueries({ queryKey: ["new-pending-tenants"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete center");
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

  const handleDelete = (tenantId) => {
    deleteMutation.mutate(tenantId);
  };

  const isLoading_ =
    approveMutation.isPending ||
    inactiveMutation.isPending ||
    blockMutation.isPending ||
    deleteMutation.isPending;

  return {
    tenants: data?.data?.tenants || [],
    totalPages: data?.data?.totalPages || 1,
    currentPage: data?.data?.currentPage || 1,
    isLoading,
    isError,
    handleApprove,
    handleBlock,
    handleDelete,
    handleInactive,
    isActionLoading: isLoading_,
  };
};