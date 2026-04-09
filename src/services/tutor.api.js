import API from "./api";

// Get tutor dashboard data
export const getTutorDashboardApi = () => {
  return API.get("/tutor/dashboard");
};

//update profile
export const updateProfileApi = (formData)=>{
  return API.put("/tutor/profile", formData)
}

export const getProfileApi = () => {
  return API.get("/tutor/profile");
};