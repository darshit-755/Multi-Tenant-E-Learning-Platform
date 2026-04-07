import API from "./api";

export const markAttendance = async (classId, attendanceData) => {
  try {
    const response = await API.post("/attendance/mark", {
      classId,
      attendanceData,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getAttendanceByClass = async (classId) => {
  try {
    const response = await API.get(`/attendance/class/${classId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getStudentAttendance = async (studentId) => {
  try {
    const response = await API.get(`/attendance/student/${studentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getMyStudentAttendance = async () => {
  try {
    const response = await API.get('/attendance/student/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getAttendanceSummary = async (batchId) => {
  try {
    const response = await API.get(`/attendance/batch/${batchId}/summary`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateAttendanceRecord = async (attendanceId, present, notes) => {
  try {
    const response = await API.put(`/attendance/${attendanceId}`, {
      present,
      notes,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
