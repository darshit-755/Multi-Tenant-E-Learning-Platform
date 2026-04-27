import { Outlet, useLocation } from "react-router-dom";
import StudentSidebar from "@/components/student/StudentSidebar";
import StudentFooter from "@/components/student/StudentFooter";
import StudentHeader from "@/components/student/StudentHeader";
import { VideoProgressProvider } from "@/contexts/VideoProgressContext";

const StudentLayout = () => {
  const location = useLocation();
  const isMaterialRoute = location.pathname.startsWith("/student/material");

  return (
    <VideoProgressProvider>
      <div
        className={
          isMaterialRoute
            ? "h-screen flex flex-col bg-slate-950 overflow-hidden"
            : "min-h-screen flex flex-col bg-slate-950"
        }
      >
       
        <StudentHeader />

        
        <div className="flex flex-1 min-h-0">

          <StudentSidebar />

          <main className={`flex-1 min-h-0 bg-slate-100 ${isMaterialRoute ? "p-2 overflow-hidden" : "p-4 overflow-y-auto"}`}>
            <Outlet />
          </main>
        </div>

        
        <StudentFooter />
      </div>
    </VideoProgressProvider>
  );
};

export default StudentLayout;
