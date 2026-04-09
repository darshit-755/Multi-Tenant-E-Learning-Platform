import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfileApi } from "@/services/tenant.api";



export const useUpdateProfile = () => {
  // const qc = useQueryClient();

  return useMutation({
    mutationFn: updateProfileApi,
    onSuccess: () => {
      // qc.invalidateQueries(["admin-dashboard"]);
    },
  });
};
