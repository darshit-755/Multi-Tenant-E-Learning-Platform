import { useMutation } from "@tanstack/react-query";
import { updateProfileApi } from "@/services/tutor.api";



export const useUpdateProfile = () => {
  // const qc = useQueryClient();

  return useMutation({
    mutationFn: updateProfileApi,
    onSuccess: () => {
      // qc.invalidateQueries(["tutor-dashboard"]);
    },
  });
};
