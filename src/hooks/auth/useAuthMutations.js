import { useMutation , useQueryClient } from "@tanstack/react-query";
import { loginApi, registerApi , logoutApi } from "@/services/auth.api";



export const useLogin = () => {
  return useMutation({
    mutationFn: loginApi,
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: registerApi,
  });
};

export const useLogOut = ()=>{
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn : logoutApi,

    onSuccess : ()=>{
      console.log("Logout successful, invalidating online-users query...");
      queryClient.invalidateQueries({ queryKey : ["online-users"] }) 
    }
  })
}