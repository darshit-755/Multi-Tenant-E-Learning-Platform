import API from "./api";

export const getClassNotesApi = (classId) => {
  return API.get(`/class-notes/${classId}`);
};

export const addClassNoteApi = (classId, payload) => {
  return API.post(`/class-notes/${classId}`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
