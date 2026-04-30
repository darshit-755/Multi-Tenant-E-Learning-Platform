import { Routes, Route , Navigate } from "react-router-dom";


import { AuthProvider } from "@/contexts/AuthContext";

import ProtectedRoute from "@/routes/ProtectedRoutes";

import ResetPassword from "@/pages/auth/ResetPassword";

import AdminLayout from "@/layouts/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import Tenants from "@/pages/admin/Tenants";
import Tutors from "@/pages/admin/Tutors";
import Students from "@/pages/admin/Students";
import AdminStudentDetails from "@/pages/admin/StudentDetails";
import Batches from "@/pages/admin/Batches";
import AdminProfile from "@/pages/admin/Profile";

import TenantLayout from "@/layouts/TenantLayout";
import TenantDashboard from "@/pages/tenant/TenantDashboard";
import TenantProfile from "@/pages/tenant/Profile";

import AddTutor from "@/pages/tenant/AddTutor";
import AddStudent from "@/pages/tenant/AddStudent";
import TenantStudentDetails from "@/pages/tenant/StudentDetails";
import ManageClasses from "@/pages/tenant/ManageClasses";
import AddSubject from "@/pages/tenant/AddSubject";
import CreateBatch from "@/pages/tenant/CreateBatch";
import TenantDoubtsPage from "@/pages/tenant/TenantDoubtsPage";

//tutor pages
import TutorLayout from "@/layouts/TutorLayout";
import TutorDashboard from "@/pages/tutor/TutorDashboard";
import TutorProfile from "@/pages/tutor/Profile";
import TutorMyClasses from "@/pages/tutor/MyClasses";
import TutorBatches from "@/pages/tutor/Batches";
import TutorStudents from "@/pages/tutor/Students";
import TutorAttendancePage from "@/pages/tutor/TutorAttendancePage";
import TakeAttendance from "@/pages/tutor/TakeAttendance";
import TutorAttendanceReport from "@/pages/tutor/AttendanceReport";
import TutorNotesPage from "@/pages/tutor/Notes";

//student pages
import StudentLayout from "@/layouts/StudentLayout";
import StudentDashboard from "@/pages/student/StudentDashboard";
import StudentProfile from "@/pages/student/Profile";
import StudentClasses from "@/pages/student/StudentClasses";
import StudentBatches from "@/pages/student/StudentBatches";
import StudentMaterial from "@/pages/student/StudentMaterial";
import StudentAttendancePage from "@/pages/student/StudentAttendancePage";
import StudentNotesPage from "@/pages/student/StudentNotes";
import TutorDoubtsHubPage from "@/pages/tutor/TutorDoubtsHubPage";
import TutorClassDoubtsPage from "@/pages/tutor/TutorClassDoubtsPage";
import StudentDoubtsHubPage from "@/pages/student/StudentDoubtsHubPage";
import StudentClassDoubtsPage from "@/pages/student/StudentClassDoubtsPage";

import Register from "@/pages/auth/Register";
import Login from "@/pages/auth/Login";
import Unauthorized from "@/components/common/Unauthorized";
import BatchAttendanceReport from "@/components/tenant/BatchAttendanceReport";

function App() {
  return (
    <Routes>
      <Route element={<AuthProvider />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={<ProtectedRoute allowedRoles={["superadmin"]} />}
        >
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/tenants" element={<Tenants />} />
            <Route path="/admin/tutors" element={<Tutors />} />
            <Route path="/admin/students" element={<Students />} />
            <Route path="/admin/student/:studentId" element={<AdminStudentDetails />} />
            <Route path="/admin/batches" element={<Batches />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
          </Route>
        </Route>

        {/* Tenant Routes */}
        <Route
          path="/tenant"
          element={<ProtectedRoute allowedRoles={["tenant"]} />}
        >
          <Route element={<TenantLayout />}>
            <Route path="/tenant/dashboard" element={<TenantDashboard />} />
            <Route path="/tenant/tutors/add" element={<AddTutor />} />
            <Route path="/tenant/tutors/view" element={<AddTutor />} />
            <Route path="/tenant/tutors/edit/:tutorId" element={<AddTutor />} />
            <Route path="/tenant/add-tutor" element={<Navigate to="/tenant/tutors/add" replace />} />
            <Route path="/tenant/students/add" element={<AddStudent />} />
            <Route path="/tenant/students/view" element={<AddStudent />} />
            <Route path="/tenant/students/edit/:studentId" element={<AddStudent />} />
            <Route path="/tenant/students/:studentId" element={<TenantStudentDetails />} />
            <Route path="/tenant/add-student" element={<Navigate to="/tenant/students/add" replace />} />
            <Route path="/tenant/add-subject" element={<AddSubject />} />
            <Route path="/tenant/batches/add" element={<CreateBatch />} />
            <Route path="/tenant/batches/view" element={<CreateBatch />} />
            <Route path="/tenant/batches/edit/:batchId" element={<CreateBatch />} />
            <Route path="/tenant/create-batch" element={<Navigate to="/tenant/batches/add" replace />} />
            <Route path="/tenant/classes/add" element={<ManageClasses />} />
            <Route path="/tenant/classes/view" element={<ManageClasses />} />
            <Route path="/tenant/classes/edit/:classId" element={<ManageClasses />} />
            <Route path="/tenant/classes" element={<Navigate to="/tenant/classes/add" replace />} />
            <Route path="/tenant/attendance-report" element={<BatchAttendanceReport />} />
            <Route path="/tenant/doubts" element={<TenantDoubtsPage />} />
            <Route path="/tenant/profile" element={<TenantProfile />} />
          </Route>
        </Route>

        {/* Tutor Routes */}
        <Route
          path="/tutor"
          element={<ProtectedRoute allowedRoles={["tutor"]} />}
        >
          <Route element={<TutorLayout />}>
            <Route path="/tutor/dashboard" element={<TutorDashboard />} />
            <Route path="/tutor/my-classes" element={<TutorMyClasses />} />
            <Route path="/tutor/attendance" element={<TutorAttendancePage />} />
            <Route path="/tutor/take-attendance/:classId" element={<TakeAttendance />} />
            <Route path="/tutor/batches" element={<TutorBatches />} />
            <Route path="/tutor/students" element={<TutorStudents />} />
            <Route path="/tutor/attendance-report" element={<TutorAttendanceReport />} />
            <Route path="/tutor/notes" element={<TutorNotesPage />} />
            <Route path="/tutor/view-material" element={<Navigate to="/tutor/notes" replace />} />
            <Route path="/tutor/doubts" element={<TutorDoubtsHubPage />} />
            <Route path="/tutor/class-doubts/:classId" element={<TutorClassDoubtsPage />} />
            <Route path="/tutor/profile" element={<TutorProfile />} />
          </Route>
        </Route>

        {/* Student Routes */}
        <Route
          path="/student"
          element={<ProtectedRoute allowedRoles={["student"]} />}
        >
          <Route element={<StudentLayout />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/classes" element={<StudentClasses />} />
            <Route path="/student/batches" element={<StudentBatches />} />
            <Route path="/student/material/:batchId" element={<StudentMaterial />} />
            <Route path="/student/material/:batchId/:classId" element={<StudentMaterial />} />
            <Route path="/student/attendance" element={<StudentAttendancePage />} />
            <Route path="/student/notes" element={<StudentNotesPage />} />
            <Route path="/student/doubts" element={<StudentDoubtsHubPage />} />
            <Route path="/student/class-doubts/:classId" element={<StudentClassDoubtsPage />} />
            <Route path="/student/profile" element={<StudentProfile />} />
          </Route>
        </Route>
      </Route>        

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
