import { Outlet } from "react-router-dom";
import TutorSidebar from "@/components/tutor/TutorSidebar";
import TutorFooter from "@/components/tutor/TutorFooter";
import TutorHeader from "@/components/tutor/TutorHeader";

const TutorLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
     
      <TutorHeader />

      
      <div className="flex flex-1">

        <TutorSidebar />

        <main className="flex-1 bg-slate-100 p-4 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      
      <TutorFooter />
    </div>
  );
};

export default TutorLayout;
