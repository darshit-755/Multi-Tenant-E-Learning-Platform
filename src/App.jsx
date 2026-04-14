import { Routes, Route , Navigate } from "react-router-dom";


import { AuthProvider } from "@/contexts/AuthContext";

import ProtectedRoute from "@/routes/ProtectedRoutes";

import ResetPassword from "@/pages/auth/ResetPassword";

import AdminLayout from "@/layouts/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import Tenants from "@/pages/admin/Tenants";
import Tutors from "@/pages/admin/Tutors";
import Students from "@/pages/admin/Students";
import Batches from "@/pages/admin/Batches";
import AdminProfile from "@/pages/admin/Profile";

import TenantLayout from "@/layouts/TenantLayout";
import TenantDashboard from "@/pages/tenant/TenantDashboard";
import TenantProfile from "@/pages/tenant/Profile";

import AddTutor from "@/pages/tenant/AddTutor";
import AddStudent from "@/pages/tenant/AddStudent";
import ManageClasses from "@/pages/tenant/ManageClasses";
import AddSubject from "@/pages/tenant/AddSubject";
import CreateBatch from "@/pages/tenant/CreateBatch";

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

//student pages
import StudentLayout from "@/layouts/StudentLayout";
import StudentDashboard from "@/pages/student/StudentDashboard";
import StudentProfile from "@/pages/student/Profile";
import StudentClasses from "@/pages/student/StudentClasses";
import StudentBatches from "@/pages/student/StudentBatches";
import StudentAttendancePage from "@/pages/student/StudentAttendancePage";
import ClassDoubtsPage from "@/pages/common/ClassDoubtsPage";
import DoubtsHubPage from "@/pages/common/DoubtsHubPage";

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
            <Route path="/tenant/add-tutor" element={<AddTutor />} />
            <Route path="/tenant/add-student" element={<AddStudent />} />
            <Route path="/tenant/add-subject" element={<AddSubject />} />
            <Route path="/tenant/create-batch" element={<CreateBatch />} />
            <Route path="/tenant/classes" element={<ManageClasses />} />
            <Route path="/tenant/attendance-report" element={<BatchAttendanceReport />} />
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
            <Route path="/tutor/doubts" element={<DoubtsHubPage role="tutor" />} />
            <Route path="/tutor/class-doubts/:classId" element={<ClassDoubtsPage role="tutor" />} />
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
            <Route path="/student/attendance" element={<StudentAttendancePage />} />
            <Route path="/student/doubts" element={<DoubtsHubPage role="student" />} />
            <Route path="/student/class-doubts/:classId" element={<ClassDoubtsPage role="student" />} />
            <Route path="/student/profile" element={<StudentProfile />} />
          </Route>
        </Route>
      </Route>        

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
