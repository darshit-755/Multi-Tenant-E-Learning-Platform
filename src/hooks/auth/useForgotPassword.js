import {forgotPasswordApi , resetPasswordApi} from "@/services/auth.api";
import { useMutation } from "@tanstack/react-query";


export const useForgotPassword =  ()=>{
    return useMutation({
        mutationFn : forgotPasswordApi,
    })
}

export const useResetPassword = ()=>{
    return useMutation({
        mutationFn : resetPasswordApi,
    })
}