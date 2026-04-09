import { Outlet } from "react-router-dom";
import StudentSidebar from "@/components/student/StudentSidebar";
import StudentFooter from "@/components/student/StudentFooter";
import StudentHeader from "@/components/student/StudentHeader";

const StudentLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
     
      <StudentHeader />

      
      <div className="flex flex-1">

        <StudentSidebar />

        <main className="flex-1 bg-slate-100 p-4 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      
      <StudentFooter />
    </div>
  );
};

export default StudentLayout;
