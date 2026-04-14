import API from "./api";

export const getClassDoubtConversationApi = (classId) => {
  return API.get(`/class-doubts/${classId}`);
};

export const addClassDoubtMessageApi = (classId, formData) => {
  return API.post(`/class-doubts/${classId}/messages`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
