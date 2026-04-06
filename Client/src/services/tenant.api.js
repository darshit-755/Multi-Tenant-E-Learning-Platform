import API from "./api";

// Register Tutor
export const registerTutorApi = (data) => {
  return API.post("/tenant/register/tutor", data);
};

// Get all tutors of logged-in tenant
export const getTenantTutorsApi = () => {
  return API.get("/tenant/tutors");
};

// Delete tutor
export const deleteTutorApi = (tutorId) => {
  return API.delete(`/tenant/tutors/${tutorId}`);
};

// Update tutor
export const updateTutorApi = (tutorId, data) => {
  return API.put(`/tenant/tutors/${tutorId}`, data);
};

// Register Student
export const registerStudentApi = (data) => {
  return API.post("/tenant/register/student", data);
};

// Get all students of logged-in tenant
export const getTenantStudentsApi = () => {
  return API.get("/tenant/students");
};

// Delete student
export const deleteStudentApi = (studentId) => {
  return API.delete(`/tenant/students/${studentId}`);
};

// Update student
export const updateStudentApi = (studentId, data) => {
  return API.put(`/tenant/students/${studentId}`, data);
};
//update profile
export const updateProfileApi = (formData)=>{
  return API.put("/tenant/profile", formData)
}

export const getProfileApi = () => {
  return API.get("/tenant/profile");
};

export const createSubjectApi = (data) => {
  return API.post("/tenant/subjects", data);
};

export const getTenantSubjectsApi = () => {
  return API.get("/tenant/subjects");
};

export const updateSubjectApi = (subjectId, data) => {
  return API.put(`/tenant/subjects/${subjectId}`, data);
};

export const createBatchApi = (data) => {
  return API.post("/tenant/batches", data);
};

export const getTenantBatchesApi = () => {
  return API.get("/tenant/batches");
};

export const updateBatchApi = (batchId, data) => {
  return API.put(`/tenant/batches/${batchId}`, data);
};

export const getMeetLinkApi = async ({ date, startTime, endTime, provider, topic }) => {
      const res = await API.post("/meet/create", {
        date,
        startTime,
        endTime,
        provider,
        topic,
      });
      return res.data;
    }