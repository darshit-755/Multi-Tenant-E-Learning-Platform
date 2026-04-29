import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  UserPlus,
  GraduationCap,
  BookOpen,
  BookMarked,
  Users,
  ChevronDown,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TenantSidebarContent = () => {
  const location = useLocation();
  const basePath = `/tenant`;
  const [openMenus, setOpenMenus] = useState(() => ({
    tutors: location.pathname.startsWith(`${basePath}/tutors`),
    students: location.pathname.startsWith(`${basePath}/students`),
    batches: location.pathname.startsWith(`${basePath}/batches`),
    classes: location.pathname.startsWith(`${basePath}/classes`),
  }));

  const isPathActive = (paths) => paths.some((path) => location.pathname.startsWith(path));

  const sectionClass = "flex items-center justify-between w-full px-3 py-2 rounded-md transition-colors text-slate-300 hover:bg-slate-800 hover:text-white";
  const subLinkClass = "flex items-center gap-2 px-3 py-2 ml-4 rounded-md transition-colors text-slate-300 hover:bg-slate-800 hover:text-white";

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

      <button
        type="button"
        className={cn(
          sectionClass,
          isPathActive([`${basePath}/tutors`]) && "bg-slate-800 text-white"
        )}
        onClick={() =>
          setOpenMenus((prev) => ({ ...prev, tutors: !prev.tutors }))
        }
      >
        <span className="flex items-center gap-2">
          <UserPlus size={18} />
          Tutors
        </span>
        <ChevronDown size={16} className={cn("transition-transform", openMenus.tutors && "rotate-180")} />
      </button>
      {openMenus.tutors && (
        <div className="space-y-1">
          <Link to={`${basePath}/tutors/add`} className={cn(subLinkClass, location.pathname === `${basePath}/tutors/add` && "bg-slate-800 text-white")}>Add Tutor</Link>
          <Link to={`${basePath}/tutors/view`} className={cn(subLinkClass, location.pathname === `${basePath}/tutors/view` && "bg-slate-800 text-white")}>View Tutors</Link>
        </div>
      )}

      <button
        type="button"
        className={cn(
          sectionClass,
          isPathActive([`${basePath}/batches`]) && "bg-slate-800 text-white"
        )}
        onClick={() =>
          setOpenMenus((prev) => ({ ...prev, batches: !prev.batches }))
        }
      >
        <span className="flex items-center gap-2">
          <Users size={18} />
          Batches
        </span>
        <ChevronDown size={16} className={cn("transition-transform", openMenus.batches && "rotate-180")} />
      </button>
      {openMenus.batches && (
        <div className="space-y-1">
          <Link to={`${basePath}/batches/add`} className={cn(subLinkClass, location.pathname === `${basePath}/batches/add` && "bg-slate-800 text-white")}>Add Batch</Link>
          <Link to={`${basePath}/batches/view`} className={cn(subLinkClass, location.pathname === `${basePath}/batches/view` && "bg-slate-800 text-white")}>View Batches</Link>
        </div>
      )}

      <button
        type="button"
        className={cn(
          sectionClass,
          isPathActive([`${basePath}/students`]) && "bg-slate-800 text-white"
        )}
        onClick={() =>
          setOpenMenus((prev) => ({ ...prev, students: !prev.students }))
        }
      >
        <span className="flex items-center gap-2">
          <GraduationCap size={18} />
          Students
        </span>
        <ChevronDown size={16} className={cn("transition-transform", openMenus.students && "rotate-180")} />
      </button>
      {openMenus.students && (
        <div className="space-y-1">
          <Link to={`${basePath}/students/add`} className={cn(subLinkClass, location.pathname === `${basePath}/students/add` && "bg-slate-800 text-white")}>Add Student</Link>
          <Link to={`${basePath}/students/view`} className={cn(subLinkClass, location.pathname === `${basePath}/students/view` && "bg-slate-800 text-white")}>View Students</Link>
        </div>
      )}

      <button
        type="button"
        className={cn(
          sectionClass,
          isPathActive([`${basePath}/classes`]) && "bg-slate-800 text-white"
        )}
        onClick={() =>
          setOpenMenus((prev) => ({ ...prev, classes: !prev.classes }))
        }
      >
        <span className="flex items-center gap-2">
          <BookOpen size={18} />
          Classes
        </span>
        <ChevronDown size={16} className={cn("transition-transform", openMenus.classes && "rotate-180")} />
      </button>
      {openMenus.classes && (
        <div className="space-y-1">
          <Link to={`${basePath}/classes/add`} className={cn(subLinkClass, location.pathname === `${basePath}/classes/add` && "bg-slate-800 text-white")}>Add Class</Link>
          <Link to={`${basePath}/classes/view`} className={cn(subLinkClass, location.pathname === `${basePath}/classes/view` && "bg-slate-800 text-white")}>View Classes</Link>
        </div>
      )}

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

      <Link
        to={`${basePath}/doubts`}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
          "text-slate-300 hover:bg-slate-800 hover:text-white",
          location.pathname === `${basePath}/doubts` &&
            "bg-slate-800 text-white"
        )}
      >
        <MessageSquare size={18} />
        Doubts
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
