import API from "./api";

// Get all pending tenant requests
export const getPendingTenantsApi = () => {
  return API.get("/admin/tenants/pending");
};

// Get all tenants
export const getAllTenantsApi = (page = 1, limit = 10) => {
  return API.get(`/admin/tenants?page=${page}&limit=${limit}`);
};

// Approve tenant
export const approveTenantApi = (tenantId) => {
  return API.patch(`/admin/tenants/${tenantId}/approve`);
};
// inactive tenant
export const makeTenantInactiveApi = (tenantId) => {
  return API.patch(`/admin/tenants/${tenantId}/inactive`);
};



// Block tenant
export const blockTenantApi = (tenantId) => {
  return API.patch(`/admin/tenants/${tenantId}/block`);
};

//get Online Users
export const getOnlineUsersApi = ()=>{
  return API.get("/admin/online-users");
}

//update profile
export const updateProfileApi = (formData)=>{
  return API.put("/admin/profile", formData)
}

export const getProfileApi = () => {
  return API.get("/admin/profile");
};

// Get all tutors
export const getAllTutorsApi = (page = 1, limit = 10) => {
  return API.get(`/admin/tutors?page=${page}&limit=${limit}`);
};

// Get all students
export const getAllStudentsApi = (page = 1, limit = 10) => {
  return API.get(`/admin/students?page=${page}&limit=${limit}`);
};

// Get all batches
export const getAllBatchesApi = (page = 1, limit = 10) => {
  return API.get(`/admin/batches?page=${page}&limit=${limit}`);
};

export default API;