import { useQuery } from "@tanstack/react-query";
import {getOnlineUsersApi} from "@/services/admin.api"

export const useGetOnlineUsers = ()=>{
    return useQuery({
        queryKey : ["online-users"],
        queryFn : getOnlineUsersApi
    })
}