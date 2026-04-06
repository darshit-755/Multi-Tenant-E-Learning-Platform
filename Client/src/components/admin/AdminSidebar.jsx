import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, UserPlus, ClipboardList, Users, GraduationCap, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const AdminSidebarContent = () => {
  const location = useLocation();

  const basePath = `/admin`;

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
        to={`${basePath}/tenants`}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
          "text-slate-300 hover:bg-slate-800 hover:text-white",
          location.pathname === `${basePath}/tenants` &&
            "bg-slate-800 text-white"
        )}
      >
        <ClipboardList size={18} />
        Tenants
      </Link>

      <Link
        to={`${basePath}/tutors`}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
          "text-slate-300 hover:bg-slate-800 hover:text-white",
          location.pathname === `${basePath}/tutors` &&
            "bg-slate-800 text-white"
        )}
      >
        <Users size={18} />
        Tutors
      </Link>

      <Link
        to={`${basePath}/students`}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
          "text-slate-300 hover:bg-slate-800 hover:text-white",
          location.pathname === `${basePath}/students` &&
            "bg-slate-800 text-white"
        )}
      >
        <GraduationCap size={18} />
        Students
      </Link>

      <Link
        to={`${basePath}/batches`}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
          "text-slate-300 hover:bg-slate-800 hover:text-white",
          location.pathname === `${basePath}/batches` &&
            "bg-slate-800 text-white"
        )}
      >
        <BookOpen size={18} />
        Batches
      </Link>
    </nav>
  );
};

const AdminSidebar = () => {
  return (
    <aside className="hidden lg:block w-64 bg-slate-900 text-white p-4">
      <AdminSidebarContent />
    </aside>
  );
};

export { AdminSidebarContent };
export default AdminSidebar;
