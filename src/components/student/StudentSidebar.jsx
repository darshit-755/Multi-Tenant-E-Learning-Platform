import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery, useQueries } from "@tanstack/react-query";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  MessageCircleQuestion,
  NotebookPen,
  BookOpenText,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Play,
  Layers,
  FolderOpen,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { useGetMyBatches } from "@/hooks/student/useGetMyBatches";
import { useGetMyClasses } from "@/hooks/student/useGetMyClasses";
import { getClassNotesApi } from "@/services/classNote.api";
import { cn } from "@/lib/utils";
import { useVideoProgress } from "@/contexts/VideoProgressContext";

const StudentSidebarContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: batchesData } = useGetMyBatches();
  const { data: classesData } = useGetMyClasses();
  const { getClassProgress } = useVideoProgress();

  const basePath = `/student`;
  const isMaterialRoute = location.pathname.startsWith(`${basePath}/material`);

  const batches = useMemo(() => batchesData?.batches || [], [batchesData]);
  const classes = useMemo(() => classesData?.classes || [], [classesData]);

  // Extract batchId and classId from route
  const pathParts = location.pathname.split("/");
  const activeBatchId =
    pathParts.length >= 4 && pathParts[2] === "material" ? pathParts[3] : "";
  const activeClassId =
    pathParts.length >= 5 && pathParts[2] === "material" ? pathParts[4] : "";

  // Material dropdown open state (only for default menu mode)
  const [materialOpen, setMaterialOpen] = useState(false);
  // Resources folder open state per lecture
  const [resourcesOpen, setResourcesOpen] = useState({});

  const toggleResourcesOpen = (classId) =>
    setResourcesOpen((prev) => ({
      ...prev,
      [classId]: !prev[classId],
    }));

  const openPdfInMaterialView = ({ batchId, classId, url, name }) => {
    if (!batchId || !classId || !url) return;

    const query = new URLSearchParams({
      view: "pdf",
      pdf: url,
      name: name || "PDF Preview",
    });

    navigate(`${basePath}/material/${batchId}/${classId}?${query.toString()}`);
  };

  const isMaterialOpen = isMaterialRoute || materialOpen;

  // Fetch notes/PDFs for the active class
  const { data: classNotesData } = useQuery({
    queryKey: ["sidebar-class-notes", activeClassId],
    queryFn: async () => {
      const { data: responseData } = await getClassNotesApi(activeClassId);
      return responseData;
    },
    enabled: Boolean(activeClassId),
  });

  // Get classes for active batch
  const classesForBatch = useMemo(
    () =>
      classes.filter(
        (cls) => String(cls.batchId?._id || "") === String(activeBatchId)
      ),
    [classes, activeBatchId]
  );

  const notesQueries = useQueries({
    queries: classesForBatch.map((cls) => ({
      queryKey: ["sidebar-class-notes-by-class", cls._id],
      queryFn: async () => {
        const { data: responseData } = await getClassNotesApi(cls._id);
        return responseData;
      },
      enabled: Boolean(cls._id) && Boolean(activeBatchId),
      staleTime: 60 * 1000,
    })),
  });

  const classPdfsMap = useMemo(() => {
    const map = {};
    classesForBatch.forEach((cls, idx) => {
      const notes = notesQueries[idx]?.data?.notes || [];
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

      map[cls._id] = pdfs;
    });
    return map;
  }, [classesForBatch, notesQueries]);

  const classLectureMetaMap = useMemo(() => {
    const map = {};

    classesForBatch.forEach((cls, idx) => {
      const notes = notesQueries[idx]?.data?.notes || [];

      for (const note of notes) {
        if (note?.lectureLink && typeof note.lectureLink === "string" && note.lectureLink.trim()) {
          map[cls._id] = {
            label: note.title || "Video Lecture",
            hasVideo: true,
          };
          return;
        }

        if (Array.isArray(note?.videos) && note.videos.length > 0) {
          const firstVideo = note.videos[0];
          const videoName =
            typeof firstVideo === "string"
              ? String(firstVideo).split("/").pop() || "Video Lecture"
              : firstVideo?.name || String(firstVideo?.url || "").split("/").pop() || "Video Lecture";

          map[cls._id] = {
            label: videoName,
            hasVideo: true,
          };
          return;
        }
      }

      map[cls._id] = {
        label: `${cls.topic || "Class Session"} (No video yet)`,
        hasVideo: false,
      };
    });

    return map;
  }, [classesForBatch, notesQueries]);

  // Get active batch data
  const activeBatch = useMemo(
    () => batches.find((b) => b._id === activeBatchId),
    [batches, activeBatchId]
  );

  const menuItems = [
    { label: "Dashboard", href: `${basePath}/dashboard`, icon: LayoutDashboard },
    { label: "My Classes", href: `${basePath}/classes`, icon: BookOpen },
    { label: "My Batches", href: `${basePath}/batches`, icon: Users },
    { label: "My Attendance", href: `${basePath}/attendance`, icon: BookOpen },
    { label: "Doubts", href: `${basePath}/doubts`, icon: MessageCircleQuestion },
    { label: "Notes", href: `${basePath}/notes`, icon: NotebookPen },
  ];

  /* ═══════════════════════════════════════════════════════
     MODE 2: Batch selected — show video lectures list
     (like Udemy course player sidebar)
     ═══════════════════════════════════════════════════════ */
  if (isMaterialRoute && activeBatchId) {
    return (
      <>
        <div className="space-y-3">
          {/* Back to menu */}
          <button
            type="button"
            onClick={() => navigate(`${basePath}/dashboard`)}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors px-1 cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back to Menu
          </button>

          {/* Batch info header */}
          {activeBatch && (
            <div className="bg-slate-800 rounded-lg p-3 space-y-1">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-blue-400 shrink-0" />
                <p className="text-sm font-semibold text-white truncate capitalize">
                  {activeBatch.name}
                </p>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Subject: {activeBatch.subjectId?.name || "—"}
              </p>
              <p className="text-[11px] text-slate-400 truncate capitalize">
                Tutor: {activeBatch.teacherId?.userId?.name || "—"}
              </p>
            </div>
          )}

          {/* Divider */}
          <hr className="border-slate-700/60" />

          {/* Section: Video Lectures */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-medium mb-2 px-1">
              Video Lectures ({classesForBatch.length})
            </p>

            {classesForBatch.length === 0 ? (
              <p className="text-xs text-slate-600 px-2 py-3 italic text-center">
                No lectures available yet
              </p>
            ) : (
              <div className="space-y-0.5 max-h-[calc(100vh-260px)] overflow-y-auto pr-1 scrollbar-thin">
                {classesForBatch.map((cls, index) => {
                  const isActive = activeClassId === cls._id;
                  const lectureMeta = classLectureMetaMap[cls._id] || {
                    label: "Class Session (No video yet)",
                    hasVideo: false,
                  };
                  const clsProgress = getClassProgress(cls._id);
                  const progressPercent = clsProgress?.maxProgress || 0;
                  const isWatched = progressPercent >= 75;
                  return (
                    <div key={cls._id}>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `${basePath}/material/${activeBatchId}/${cls._id}`
                          )
                        }
                        className={cn(
                          "flex flex-col w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all group cursor-pointer",
                          "text-slate-400 hover:bg-slate-800 hover:text-white",
                          isActive &&
                          "bg-blue-600/15 text-blue-300 ring-1 ring-blue-500/30"
                        )}
                      >
                        <div className="flex items-center gap-2.5 w-full">
                          <span
                            className={cn(
                              "text-[10px] font-mono shrink-0 w-4 text-right",
                              isActive ? "text-blue-400" : "text-slate-600"
                            )}
                          >
                            {index + 1}
                          </span>
                          {isWatched ? (
                            <CheckCircle2
                              size={12}
                              className="shrink-0 text-green-400"
                            />
                          ) : (
                            <Play
                              size={12}
                              className={cn(
                                "shrink-0",
                                isActive
                                  ? "text-blue-400 fill-blue-400"
                                  : "text-slate-600 group-hover:text-blue-400"
                              )}
                            />
                          )}
                          <span className="truncate font-medium flex-1">
                            {lectureMeta.label}
                          </span>
                          {progressPercent > 0 && (
                            <span
                              className={cn(
                                "text-[10px] font-semibold tabular-nums shrink-0",
                                isWatched ? "text-green-400" : "text-blue-400"
                              )}
                            >
                              {Math.round(progressPercent)}%
                            </span>
                          )}
                        </div>
                        {/* Progress bar */}
                        {lectureMeta.hasVideo && progressPercent > 0 && (
                          <div className="mt-1.5 ml-[26px] mr-0.5 h-1 rounded-full bg-slate-700/60 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min(100, Math.round(progressPercent))}%`,
                                background: isWatched
                                  ? "linear-gradient(90deg, #22c55e, #16a34a)"
                                  : "linear-gradient(90deg, #3b82f6, #2563eb)",
                              }}
                            />
                          </div>
                        )}
                      </button>

                      {/* Resources folder — shown under every lecture */}
                      {(() => {
                        const classPdfs = classPdfsMap[cls._id] || [];
                        const isResourcesOpen = Boolean(resourcesOpen[cls._id]);

                        return classPdfs.length > 0 ? (
                          <div className="ml-9 mt-1 mb-1">
                            <button
                              type="button"
                              onClick={() => toggleResourcesOpen(cls._id)}
                              className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-white transition-colors w-full px-1 py-1"
                            >
                              {isResourcesOpen ? (
                                <ChevronDown size={12} className="shrink-0" />
                              ) : (
                                <ChevronRight size={12} className="shrink-0" />
                              )}
                              <FolderOpen size={12} className="shrink-0 text-yellow-500" />
                              <span>Resources ({classPdfs.length})</span>
                            </button>

                            {isResourcesOpen && (
                              <div className="ml-4 mt-0.5 space-y-0.5 border-l border-slate-700/50 pl-2">
                                {classPdfs.map((pdf, pIdx) => (
                                  <button
                                    key={pIdx}
                                    type="button"
                                    onClick={() =>
                                      openPdfInMaterialView({
                                        batchId: activeBatchId,
                                        classId: cls._id,
                                        url: pdf.url,
                                        name: pdf.name,
                                      })
                                    }
                                    className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-white hover:bg-slate-800 rounded px-1.5 py-1 transition-colors w-full text-left cursor-pointer"
                                  >
                                    <FileText size={11} className="shrink-0 text-red-400" />
                                    <span className="truncate">{pdf.name}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : null;
                      })()}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  /* ═══════════════════════════════════════════════════════
     MODE 1: Default menu with Material → Batches dropdown
     ═══════════════════════════════════════════════════════ */
  return (
    <>
      <nav className="space-y-1">
        {/* Regular menu items */}
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

        {/* Material with batch dropdown */}
        <div>
          <button
            type="button"
            onClick={() => setMaterialOpen((prev) => !prev)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md transition-colors w-full text-left cursor-pointer",
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
                isMaterialOpen && "rotate-180"
              )}
            />
          </button>

          {/* Batch list under Material */}
          {isMaterialOpen && (
            <div className="ml-6 mt-1 space-y-0.5 border-l-2 border-slate-700 pl-3">
              {batches.length > 0 ? (
                batches.map((batch) => (
                  <button
                    key={batch._id}
                    type="button"
                    onClick={() => {
                      const batchClasses = classes.filter(
                        (cls) => String(cls.batchId?._id || "") === String(batch._id)
                      );
                      const firstClass = batchClasses[0];
                      if (firstClass) {
                        navigate(`${basePath}/material/${batch._id}/${firstClass._id}`);
                      } else {
                        navigate(`${basePath}/material/${batch._id}`);
                      }
                    }}
                    className={cn(
                      "flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors cursor-pointer",
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
    </>
  );
};

const StudentSidebar = () => {
  const location = useLocation();
  const isMaterialRoute = location.pathname.startsWith("/student/material");

  return (
    <aside
      className={cn(
        "hidden lg:block w-64 bg-slate-900 text-white p-4",
        isMaterialRoute ? "overflow-hidden" : "overflow-y-auto"
      )}
    >
      <StudentSidebarContent />
    </aside>
  );
};

export { StudentSidebarContent };
export default StudentSidebar;
