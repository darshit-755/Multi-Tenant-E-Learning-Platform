import API from "./api";

// Get student dashboard data
export const getStudentDashboardApi = () => {
  return API.get("/student/dashboard");
};

//update profile
export const updateProfileApi = (formData)=>{
  return API.put("/student/profile", formData)
}

export const getProfileApi = () => {
  return API.get("/student/profile");
};

// Get my classes (student)
export const getStudentClassesApi = () => {
  return API.get("/class/student/my-classes");
};

// Get my batches (student)
export const getStudentBatchesApi = () => {
  return API.get("/student/my-batches");
};