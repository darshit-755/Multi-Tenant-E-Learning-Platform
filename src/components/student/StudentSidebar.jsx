import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, BookOpen, Users, MessageCircleQuestion } from "lucide-react";
import { cn } from "@/lib/utils";

const StudentSidebarContent = () => {
  const location = useLocation();

  const basePath = `/student`;

  const menuItems = [
    {
      label: "Dashboard",
      href: `${basePath}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      label: "My Classes",
      href: `${basePath}/classes`,
      icon: BookOpen,
    },
    {
      label: "My Batches",
      href: `${basePath}/batches`,
      icon: Users,
    },
    {
      label: "My Attendance",
      href: `${basePath}/attendance`,
      icon: BookOpen,
    },
    {
      label: "Doubts",
      href: `${basePath}/doubts`,
      icon: MessageCircleQuestion,
    },
  ];

  return (
    <nav className="space-y-2">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
              "text-slate-300 hover:bg-slate-800 hover:text-white",
              location.pathname === item.href &&
                "bg-slate-800 text-white"
            )}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};

const StudentSidebar = () => {
  return (
    <aside className="hidden lg:block w-64 bg-slate-900 text-white p-4">
      <StudentSidebarContent />
    </aside>
  );
};

export { StudentSidebarContent };
export default StudentSidebar;
