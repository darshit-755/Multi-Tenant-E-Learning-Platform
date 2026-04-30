import { Link, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { LayoutDashboard, BookOpen, Users, BarChart3, MessageCircleQuestion, NotebookPen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetMyClasses } from "@/hooks/tutor/useGetMyClasses";

const TutorSidebarContent = () => {
  const location = useLocation();
  const { data: classesData } = useGetMyClasses();

  const totalDoubtCount = useMemo(() => {
    const classes = classesData?.classes || [];
    return classes.reduce(
      (sum, cls) => sum + (Number(cls?.doubtCount) || 0),
      0
    );
  }, [classesData]);

  const basePath = `/tutor`;

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
        to={`${basePath}/my-classes`}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
          "text-slate-300 hover:bg-slate-800 hover:text-white",
          location.pathname === `${basePath}/my-classes` &&
          "bg-slate-800 text-white"
        )}
      >
        <BookOpen size={18} />
        My Classes
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
        <Users size={18} />
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
        <Users size={18} />
        Students
      </Link>

      <Link
        to={`${basePath}/attendance`}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
          "text-slate-300 hover:bg-slate-800 hover:text-white",
          (location.pathname === `${basePath}/attendance` ||
            location.pathname.includes(`${basePath}/take-attendance`)) &&
          "bg-slate-800 text-white"
        )}
      >
        <BookOpen size={18} />
        Take Attendance
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
        <BarChart3 size={18} />
        Attendance Report
      </Link>

     

      <Link
        to={`${basePath}/doubts`}
        className={cn(
          "flex items-center justify-between gap-2 px-3 py-2 rounded-md transition-colors",
          "text-slate-300 hover:bg-slate-800 hover:text-white",
          location.pathname === `${basePath}/doubts` &&
          "bg-slate-800 text-white"
        )}
      >
        <span className="flex items-center gap-2">
          <MessageCircleQuestion size={18} />
          Doubts
        </span>
        {totalDoubtCount > 0 && (
          <span className="inline-flex items-center justify-center rounded-full bg-slate-700 px-2 py-0.5 text-[11px] font-semibold text-slate-100">
            {totalDoubtCount}
          </span>
        )}
      </Link>

       <Link
        to={`${basePath}/notes`}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
          "text-slate-300 hover:bg-slate-800 hover:text-white",
          location.pathname === `${basePath}/notes` &&
          "bg-slate-800 text-white"
        )}
      >
        <NotebookPen size={18} />
        Notes
      </Link>

    </nav>
  );
};

const TutorSidebar = () => {
  return (
    <aside className="hidden lg:block w-64 bg-slate-900 text-white p-4 overflow-y-auto">
      <TutorSidebarContent />
    </aside>
  );
};

export { TutorSidebarContent };
export default TutorSidebar;
