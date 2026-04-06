import API from "./api";

// Create a class (tenant)
export const createClassApi = (data) => {
  return API.post("/class", data);
};

// Get all classes (tenant)
export const getClassesApi = () => {
  return API.get("/class");
};

// Update a class (tenant)
export const updateClassApi = (classId, data) => {
  return API.put(`/class/${classId}`, data);
};

// Delete a class (tenant)
export const deleteClassApi = (classId) => {
  return API.delete(`/class/${classId}`);
};

// Get my classes (tutor)
export const getTutorClassesApi = () => {
  return API.get("/class/tutor/my-classes");
};
