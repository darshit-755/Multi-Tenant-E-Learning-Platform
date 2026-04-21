import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  MessageCircleQuestion,
  NotebookPen,
  BookOpenText,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Play,
  FileText,
} from "lucide-react";
import { useGetMyBatches } from "@/hooks/student/useGetMyBatches";
import { useGetMyClasses } from "@/hooks/student/useGetMyClasses";
import { getClassNotesApi } from "@/services/classNote.api";
import { cn } from "@/lib/utils";

const StudentSidebarContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: batchesData } = useGetMyBatches();
  const { data: classesData } = useGetMyClasses();

  const basePath = `/student`;
  const isMaterialRoute = location.pathname.startsWith(`${basePath}/material`);

  const batches = useMemo(() => batchesData?.batches || [], [batchesData]);
  const classes = useMemo(() => classesData?.classes || [], [classesData]);

  // Extract batchId and classId from route
  const pathParts = location.pathname.split("/");
  const activeBatchId = pathParts.length >= 4 && pathParts[3] ? pathParts[3] : "";
  const activeClassId = pathParts.length >= 5 && pathParts[4] ? pathParts[4] : "";

  // Material dropdown state
  const [materialOpen, setMaterialOpen] = useState(isMaterialRoute);
  const [resourcesOpen, setResourcesOpen] = useState(true);

  // Get current class data
  const activeClass = useMemo(
    () => classes.find((cls) => cls._id === activeClassId),
    [classes, activeClassId]
  );

  // Fetch notes for active class (for Resources dropdown)
  const { data: classNotesData } = useQuery({
    queryKey: ["student-material-notes", activeClassId],
    queryFn: async () => {
      const { data: responseData } = await getClassNotesApi(activeClassId);
      return responseData;
    },
    enabled: Boolean(activeClassId),
  });

  // Collect all PDFs from notes
  const allPdfs = useMemo(() => {
    const notes = classNotesData?.notes || [];
    const pdfs = [];
    notes.forEach((note) => {
      if (Array.isArray(note.pdfs)) {
        note.pdfs.forEach((pdf) => {
          const pdfUrl = typeof pdf === "string" ? pdf : pdf?.url;
          const pdfName =
            typeof pdf === "string"
              ? String(pdf).split("/").pop() || "PDF"
              : pdf?.name || String(pdf?.url || "").split("/").pop() || "PDF";
          if (pdfUrl) pdfs.push({ url: pdfUrl, name: pdfName });
        });
      }
    });
    return pdfs;
  }, [classNotesData]);

  const menuItems = [
    { label: "Dashboard", href: `${basePath}/dashboard`, icon: LayoutDashboard },
    { label: "My Classes", href: `${basePath}/classes`, icon: BookOpen },
    { label: "My Batches", href: `${basePath}/batches`, icon: Users },
    { label: "My Attendance", href: `${basePath}/attendance`, icon: BookOpen },
    { label: "Doubts", href: `${basePath}/doubts`, icon: MessageCircleQuestion },
    { label: "Notes", href: `${basePath}/notes`, icon: NotebookPen },
  ];

  const handleBatchClick = (batchId) => {
    navigate(`${basePath}/material/${batchId}`);
  };

  /* ═══════════════════════════════════════════════════════
     VIEW 3: Batch selected + Class selected
     Show: Back, batch list, selected class, Resources
     ═══════════════════════════════════════════════════════ */
  if (isMaterialRoute && activeBatchId && activeClassId) {
    return (
      <div className="space-y-4">
        {/* Back to class list */}
        <button
          type="button"
          onClick={() => navigate(`${basePath}/material/${activeBatchId}`)}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Classes
        </button>

        {/* Batch list */}
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Batches
          </p>
          <div className="mt-2 space-y-0.5">
            {batches.map((batch) => {
              const isActive = activeBatchId === batch._id;
              return (
                <button
                  key={batch._id}
                  type="button"
                  onClick={() => handleBatchClick(batch._id)}
                  className={cn(
                    "flex items-center gap-2.5 w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors",
                    "text-slate-400 hover:bg-slate-800 hover:text-white",
                    isActive && "bg-slate-800 text-white font-medium"
                  )}
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full shrink-0",
                      isActive ? "bg-blue-400" : "bg-slate-600"
                    )}
                  />
                  <span className="truncate capitalize">{batch.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <hr className="border-slate-700" />

        {/* Selected class */}
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Current Class
          </p>
          <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-md bg-slate-800">
            <Play size={14} className="text-blue-400 shrink-0" />
            <span className="text-sm text-white font-medium truncate">
              {activeClass?.topic || "Class Session"}
            </span>
          </div>
        </div>

        {/* Resources dropdown */}
        {allPdfs.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setResourcesOpen(!resourcesOpen)}
              className="flex items-center gap-2 w-full text-left text-xs uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors"
            >
              <FileText size={14} />
              <span className="flex-1">Resources ({allPdfs.length})</span>
              {resourcesOpen ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
            </button>

            {resourcesOpen && (
              <div className="mt-2 space-y-0.5 ml-1 border-l-2 border-slate-700 pl-3">
                {allPdfs.map((pdf, index) => (
                  <a
                    key={index}
                    href={pdf.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded px-2 py-1.5 transition-colors"
                  >
                    <FileText size={12} className="shrink-0 text-red-400" />
                    <span className="truncate">{pdf.name}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════
     VIEW 2: Batch selected (no class yet)
     Show: Back, batch list with active highlighted
     ═══════════════════════════════════════════════════════ */
  if (isMaterialRoute && activeBatchId) {
    return (
      <div className="space-y-4">
        {/* Back to main menu */}
        <button
          type="button"
          onClick={() => navigate(`${basePath}/dashboard`)}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Menu
        </button>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Material
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">
            Select Batch
          </h2>
        </div>

        {/* Batch list */}
        <div className="space-y-1">
          {batches.length > 0 ? (
            batches.map((batch) => {
              const isActive = activeBatchId === batch._id;
              return (
                <button
                  key={batch._id}
                  type="button"
                  onClick={() => handleBatchClick(batch._id)}
                  className={cn(
                    "flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                    "text-slate-400 hover:bg-slate-800 hover:text-white",
                    isActive && "bg-slate-800 text-white font-medium"
                  )}
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full shrink-0",
                      isActive ? "bg-blue-400" : "bg-slate-600"
                    )}
                  />
                  <span className="truncate capitalize">{batch.name}</span>
                </button>
              );
            })
          ) : (
            <p className="text-xs text-slate-500 px-3 py-2">
              No batches assigned
            </p>
          )}
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════
     VIEW 1: Default menu with Material dropdown
     ═══════════════════════════════════════════════════════ */
  return (
    <nav className="space-y-1">
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
            <span className="flex-1">{item.label}</span>
          </Link>
        );
      })}

      {/* Material item with dropdown arrow */}
      <div>
        <button
          type="button"
          onClick={() => setMaterialOpen((prev) => !prev)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md transition-colors w-full text-left",
            "text-slate-300 hover:bg-slate-800 hover:text-white",
            isMaterialRoute && "bg-slate-800 text-white"
          )}
        >
          <BookOpenText size={18} />
          <span className="flex-1">Material</span>
          <ChevronDown
            size={16}
            className={cn(
              "transition-transform duration-200 text-slate-400",
              materialOpen && "rotate-180"
            )}
          />
        </button>

        {/* Dropdown: list of batches */}
        {materialOpen && (
          <div className="ml-6 mt-1 space-y-0.5 border-l-2 border-slate-700 pl-3">
            {batches.length > 0 ? (
              batches.map((batch) => (
                <button
                  key={batch._id}
                  type="button"
                  onClick={() => handleBatchClick(batch._id)}
                  className={cn(
                    "flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors",
                    "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full shrink-0 bg-slate-600" />
                  <span className="truncate capitalize">{batch.name}</span>
                </button>
              ))
            ) : (
              <p className="text-xs text-slate-500 px-2 py-1.5">
                No batches assigned
              </p>
            )}
          </div>
        )}
      </div>
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
