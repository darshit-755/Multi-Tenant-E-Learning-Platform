import API from "./api";

export const getClassDoubtConversationApi = (classId, studentId) => {
  const params = studentId ? { studentId } : {};
  return API.get(`/class-doubts/${classId}`, { params });
};

export const addClassDoubtMessageApi = (classId, formData, studentId) => {
  if (studentId) {
    formData.append("studentId", studentId);
  }
  return API.post(`/class-doubts/${classId}/messages`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const markDoubtSolvedApi = (classId, studentId) => {
  return API.patch(`/class-doubts/${classId}/solved`, { studentId });
};
