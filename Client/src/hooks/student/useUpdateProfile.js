import { useMutation, } from "@tanstack/react-query";
import { updateProfileApi } from "@/services/student.api";



export const useUpdateProfile = () => {
  // const qc = useQueryClient();

  return useMutation({
    mutationFn: updateProfileApi,
    onSuccess: () => {
      // qc.invalidateQueries(["student-dashboard"]);
    },
  });
};
