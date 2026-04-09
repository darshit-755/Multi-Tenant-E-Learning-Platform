import { useMutation } from "@tanstack/react-query";
import {getMeetLinkApi} from "@/services/tenant.api"

export const useCreateMeet = () => {
  return useMutation({
    mutationFn:getMeetLinkApi ,
  });
};