import { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  MessageCircleQuestion,
  NotebookPen,
  BookOpenText,
} from "lucide-react";
import { useGetMyBatches } from "@/hooks/student/useGetMyBatches";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const StudentSidebarContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: batchesData } = useGetMyBatches();

  const basePath = `/student`;
  const isMaterialRoute = location.pathname.startsWith(`${basePath}/material`);

  const batches = useMemo(() => batchesData?.batches || [], [batchesData]);
  const activeBatchId = location.pathname.split("/")[3] || batches[0]?._id || "";

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
     {
      label: "Notes",
      href: `${basePath}/notes`,
      icon: NotebookPen,
    },
    {
      label: "Material",
      href: `${basePath}/material`,
      icon: BookOpenText,
    }
  ];

  const handleBatchChange = (batchId) => {
    if (!batchId) return;
    navigate(`${basePath}/material/${batchId}`);
  };

  if (isMaterialRoute) {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Material
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">
            Select a batch
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            View the material shared for your batches.
          </p>
        </div>

        <Select value={activeBatchId} onValueChange={handleBatchChange}>
          <SelectTrigger className="w-full border-slate-700 bg-slate-950 text-white">
            <SelectValue placeholder="Choose a batch" />
          </SelectTrigger>
          <SelectContent>
            {batches.length > 0 ? (
              batches.map((batch) => (
                <SelectItem key={batch._id} value={batch._id}>
                  {batch.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="__empty" disabled>
                No batches assigned
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <nav className="space-y-2">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          location.pathname === item.href ||
          location.pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
              "text-slate-300 hover:bg-slate-800 hover:text-white",
              isActive && "bg-slate-800 text-white"
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
