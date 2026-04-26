import { useQuery } from "@tanstack/react-query";
import API from "@/services/api";

const fetchStudentDetails = async (studentId) => {
  const response = await API.get(`/admin/student/${studentId}`);
  return response.data.student;
};

export const useStudentDetails = (studentId) => {
  return useQuery({
    queryKey: ["student", studentId],
    queryFn: () => fetchStudentDetails(studentId),
    enabled: !!studentId,
  });
};