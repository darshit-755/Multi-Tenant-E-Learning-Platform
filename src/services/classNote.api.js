// Delete a note by noteId (matches backend route)
export const deleteClassNoteApi = (classId, noteId) => {
  return API.delete(`/class-notes/note/${noteId}`);
};
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
