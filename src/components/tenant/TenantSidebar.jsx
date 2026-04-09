import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  UserPlus,
  GraduationCap,
  BookOpen,
  BookMarked,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TenantSidebarContent = () => {
  const location = useLocation();

  const basePath = `/tenant`;

  return (
    <nav className="space-y-2">
      <Link
        to={`${basePath}/dashboard`}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
          "text-slate-300 hover:bg-slate-800 hover:text-white",
          location.pathname === `${basePath}/dashboard` &&
            "bg-slate-800 text-white"
        )}
      >
        <LayoutDashboard size={18} />
        Dashboard
      </Link>
      <Link
        to={`${basePath}/add-tutor`}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
          "text-slate-300 hover:bg-slate-800 hover:text-white",
          location.pathname === `${basePath}/add-tutor` &&
            "bg-slate-800 text-white"
        )}
      >
        <UserPlus size={18} />
        Add Tutor
      </Link>

      <Link
        to={`${basePath}/add-student`}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
          "text-slate-300 hover:bg-slate-800 hover:text-white",
          location.pathname === `${basePath}/add-student` &&
            "bg-slate-800 text-white"
        )}
      >
        <GraduationCap size={18} />
        Add Student
      </Link>

      <Link
        to={`${basePath}/add-subject`}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
          "text-slate-300 hover:bg-slate-800 hover:text-white",
          location.pathname === `${basePath}/add-subject` &&
            "bg-slate-800 text-white"
        )}
      >
        <BookMarked size={18} />
        Add Subject
      </Link>

      <Link
        to={`${basePath}/create-batch`}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
          "text-slate-300 hover:bg-slate-800 hover:text-white",
          location.pathname === `${basePath}/create-batch` &&
            "bg-slate-800 text-white"
        )}
      >
        <Users size={18} />
        Create Batch
      </Link>

      <Link
        to={`${basePath}/classes`}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
          "text-slate-300 hover:bg-slate-800 hover:text-white",
          location.pathname === `${basePath}/classes` &&
            "bg-slate-800 text-white"
        )}
      >
        <BookOpen size={18} />
        Manage Classes
      </Link>

      <Link
        to={`${basePath}/attendance-report`}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
          "text-slate-300 hover:bg-slate-800 hover:text-white",
          location.pathname === `${basePath}/attendance-report` &&
            "bg-slate-800 text-white"
        )}
      >
        <BookMarked size={18} />
        Attendance Reports
      </Link>

    </nav>
  );
};

const TenantSidebar = () => {
  return (
    <aside className="hidden lg:block w-64 bg-slate-900 text-white p-4">
      <TenantSidebarContent />
    </aside>
  );
};

export { TenantSidebarContent };
export default TenantSidebar;
