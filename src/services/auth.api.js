import API from "./api";


export const loginApi = (data) => {
  return API.post("/auth/login", data);
};

export const googleLoginApi = (data) => {
  return API.post("/auth/google-login", data);
};

export const logoutApi = (data) => {
  return API.post("/auth/logout", data);
};

export const registerApi = (data) => {
  return API.post("/auth/register", data);
};

export const forgotPasswordApi = (data)=>{
  return API.post("/auth/forgot-password",data)
}

export const resetPasswordApi = ({token, password})=>{
  return API.post(`/auth/reset-password/${token}`, {password})
}