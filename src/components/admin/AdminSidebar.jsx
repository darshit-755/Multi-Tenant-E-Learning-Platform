import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, UserPlus, ClipboardList, Users, GraduationCap, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getAllTenantsApi } from "@/services/admin.api";

const AdminSidebarContent = () => {
  const location = useLocation();

  const { data } = useQuery({
    queryKey: ["all-tenants", "inactive-count"],
    queryFn: () => getAllTenantsApi(1, 1),
    staleTime: 30000,
  });

  const inactiveTenantsCount = data?.data?.inactiveTenants ?? 0;

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
         <span className="ml-auto min-w-6 rounded-full bg-amber-500/20 px-2 py-0.5 text-center text-xs font-semibold text-amber-300">
          {inactiveTenantsCount}
        </span>
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
        Centers
       
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
