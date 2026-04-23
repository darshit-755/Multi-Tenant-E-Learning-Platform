import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Play,
  FileText,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Maximize2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetMyClasses } from "@/hooks/student/useGetMyClasses";
import { useGetMyBatches } from "@/hooks/student/useGetMyBatches";
import { getClassNotesApi } from "@/services/classNote.api";
import { formatDateWithDay } from "@/utils/classUtils";

/* ═══════════════════════════════════════════════════════
   VIEW 1: No batch selected — prompt to select from sidebar
   ═══════════════════════════════════════════════════════ */
const NoBatchView = ({ batches, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-4">
        <h1 className="text-2xl font-semibold text-slate-800">Material</h1>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <BookOpen className="h-8 w-8 text-slate-400" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Material</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            {batches.length === 0
              ? "You are not assigned to any batches yet."
              : "Click on the Material dropdown in the sidebar and select a batch to view its classes and resources."}
          </p>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   VIEW 2: Batch selected — show list of classes
   ═══════════════════════════════════════════════════════ */
const ClassListView = ({ activeBatch, classesForBatch, batchId }) => {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Material</h1>
          <p className="text-sm text-muted-foreground">
            {activeBatch
              ? `Classes for ${activeBatch.name}`
              : "Select a batch to view classes."}
          </p>
        </div>
      </div>

      {/* Batch Overview */}
      {activeBatch && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Batch Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-800">Batch:</span>{" "}
              {activeBatch.name}
            </p>
            <p>
              <span className="font-medium text-slate-800">Subject:</span>{" "}
              {activeBatch.subjectId?.name || "-"}
            </p>
            <p>
              <span className="font-medium text-slate-800">Tutor:</span>{" "}
              {activeBatch.teacherId?.userId?.name || "-"}
            </p>
          </CardContent>
        </Card>
      )}

    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   VIEW 3: Class selected — show videos + Resource dropdown
   ═══════════════════════════════════════════════════════ */
const ClassVideoView = ({ cls, batchId, activeBatch }) => {
  const navigate = useNavigate();

  const [pdfPreview, setPdfPreview] = useState({
    open: false,
    url: "",
    name: "",
  });
  const pdfPreviewRef = useRef(null);

  const [resourcesOpen, setResourcesOpen] = useState(false);

  const { data: classNotesData, isLoading: isNotesLoading } = useQuery({
    queryKey: ["student-material-notes", cls?._id],
    queryFn: async () => {
      const { data: responseData } = await getClassNotesApi(cls._id);
      return responseData;
    },
    enabled: Boolean(cls?._id),
  });

  const notes = classNotesData?.notes || [];

  // Collect all videos (both uploaded files and lecture links)
  const allVideos = [];
  notes.forEach((note) => {
    // Add lecture links first
    if (note.lectureLink && typeof note.lectureLink === "string" && note.lectureLink.trim()) {
      allVideos.push({
        noteId: note._id,
        url: note.lectureLink,
        name: note.title || "Video Lecture",
        index: -1,
        isLink: true,
      });
    }

    // Add uploaded video files
    if (Array.isArray(note.videos) && note.videos.length > 0) {
      note.videos.forEach((video, vIdx) => {
        const videoUrl = typeof video === "string" ? video : video?.url;
        const videoName =
          typeof video === "string"
            ? String(video).split("/").pop() || `Video ${vIdx + 1}`
            : video?.name ||
            String(video?.url || "").split("/").pop() ||
            `Video ${vIdx + 1}`;
        if (videoUrl) {
          allVideos.push({
            noteId: note._id,
            url: videoUrl,
            name: videoName,
            index: vIdx,
            isLink: false,
          });
        }
      });
    }
  });

  // Collect all PDFs
  const allPdfs = [];
  notes.forEach((note) => {
    if (Array.isArray(note.pdfs) && note.pdfs.length > 0) {
      note.pdfs.forEach((pdf, pIdx) => {
        const pdfUrl = typeof pdf === "string" ? pdf : pdf?.url;
        const pdfName =
          typeof pdf === "string"
            ? String(pdf).split("/").pop() || `PDF ${pIdx + 1}`
            : pdf?.name ||
            String(pdf?.url || "").split("/").pop() ||
            `PDF ${pIdx + 1}`;
        if (pdfUrl) allPdfs.push({ url: pdfUrl, name: pdfName });
      });
    }
  });

  const openPdfPreview = ({ url, name }) => {
    if (!url) return;
    setPdfPreview({ open: true, url, name: name || "PDF Preview" });
  };

  const openPdfFullscreen = () => {
    if (!pdfPreview.url) return;
    const container = pdfPreviewRef.current;
    if (container?.requestFullscreen) {
      container.requestFullscreen().catch(() => {
        window.open(pdfPreview.url, "_blank", "noopener,noreferrer");
      });
      return;
    }
    window.open(pdfPreview.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            {cls?.topic || "Class Session"}
          </h1>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(`/student/material`)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Batches
        </Button>
      </div>

      {/* Videos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center mb-0">
            <Play size={18} className="text-blue-600" />
            Video Recordings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {isNotesLoading ? (
            <p className="text-sm text-muted-foreground">
              Loading material...
            </p>
          ) : allVideos.length === 0 ? (
            <div className="text-center py-10">
              <Play className="mx-auto h-10 w-10 text-slate-300 mb-4" />
              <p className="text-sm text-muted-foreground">
                No video recordings available for this class.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {allVideos.map((video, idx) => (
                <div
                  key={`${video.noteId}-${video.index}`}
                  className="space-y-2"
                >
                  <p className="text-sm font-medium text-slate-700">
                    {video.name}
                  </p>
                  {video.isLink ? (
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-4 py-3 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      <Play size={18} className="text-blue-600 shrink-0" />
                      <span className="text-sm font-medium text-blue-900 truncate">
                        {video.url}
                      </span>
                      <span className="text-xs text-blue-700 ml-auto shrink-0">
                        Open →
                      </span>
                    </a>
                  ) : (
                    <div className="aspect-video rounded-lg overflow-hidden border bg-black">
                      <video
                        className="h-full w-full"
                        controls
                        src={video.url}
                        preload="metadata"
                      />
                    </div>
                  )}
                  {idx < allVideos.length - 1 && (
                    <hr className="border-slate-200 mt-2" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resources (PDFs) in main content too */}
      {!isNotesLoading && allPdfs.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <button
              type="button"
              onClick={() => setResourcesOpen(!resourcesOpen)}
              className="flex items-center gap-2 w-full text-left"
            >
              <FileText size={18} className="text-red-500" />
              <CardTitle className="text-lg flex-1">
                Resources ({allPdfs.length})
              </CardTitle>
              {resourcesOpen ? (
                <ChevronUp size={18} className="text-slate-400" />
              ) : (
                <ChevronDown size={18} className="text-slate-400" />
              )}
            </button>
          </CardHeader>
          {resourcesOpen && (
            <CardContent className="p-4 pt-0">
              <div className="space-y-2">
                {allPdfs.map((pdf, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => openPdfPreview(pdf)}
                    className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-md border hover:bg-slate-50 hover:border-blue-200 transition-colors"
                  >
                    <FileText
                      size={16}
                      className="shrink-0 text-red-500"
                    />
                    <span className="text-sm text-slate-700 truncate">
                      {pdf.name}
                    </span>
                    <span className="text-xs text-blue-600 ml-auto shrink-0">
                      View
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* PDF Preview Dialog */}
      <Dialog
        open={pdfPreview.open}
        onOpenChange={(open) =>
          setPdfPreview((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{pdfPreview.name || "PDF Preview"}</DialogTitle>
            <DialogDescription>
              Previewing file inside the dashboard.
            </DialogDescription>
            {pdfPreview.url ? (
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={openPdfFullscreen}
                  className="mt-2 h-8 gap-1.5"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  Full Screen
                </Button>
              </div>
            ) : null}
          </DialogHeader>
          <div ref={pdfPreviewRef} className="h-[50vh] rounded-md border overflow-hidden bg-slate-100">
            {pdfPreview.url ? (
              <iframe
                title={pdfPreview.name || "PDF Preview"}
                src={pdfPreview.url}
                className="w-full h-full"
                allowFullScreen
              />
            ) : (
              <p className="p-4 text-sm text-muted-foreground">
                No file selected.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   Main Page — routes to the correct view
   ═══════════════════════════════════════════════════════ */
const StudentMaterialPage = () => {
  const { batchId, classId } = useParams();
  const navigate = useNavigate();
  const {
    data: classesData,
    isLoading: isClassesLoading,
    isError: isClassesError,
  } = useGetMyClasses();
  const { data: batchesData, isLoading: isBatchesLoading } = useGetMyBatches();

  const classes = classesData?.classes || [];
  const batches = batchesData?.batches || [];

  const activeBatch = batches.find((b) => b._id === batchId);

  const classesForBatch = useMemo(
    () =>
      classes.filter(
        (cls) => String(cls.batchId?._id || "") === String(batchId)
      ),
    [classes, batchId]
  );

  const activeClass = useMemo(
    () => classes.find((cls) => cls._id === classId),
    [classes, classId]
  );

  // No auto-redirect — user picks classes from sidebar tree

  // VIEW 1: No batch
  if (!batchId) {
    return <NoBatchView batches={batches} isLoading={isBatchesLoading} />;
  }

  // Loading
  if (isClassesLoading || isBatchesLoading) {
    return <p className="text-sm text-muted-foreground p-4">Loading material...</p>;
  }

  if (isClassesError) {
    return (
      <p className="text-sm text-red-600 p-4">
        Failed to load classes for material page.
      </p>
    );
  }

  // VIEW 3: Batch + class selected
  if (batchId && classId && activeClass) {
    return (
      <ClassVideoView
        cls={activeClass}
        batchId={batchId}
        activeBatch={activeBatch}
      />
    );
  }

  // Fallback: If batch selected but no classes available
  if (batchId && classesForBatch.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <Play className="h-8 w-8 text-slate-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">No Classes</h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              There are no classes available for this batch yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Redirecting to first class...
  return <p className="text-sm text-muted-foreground p-4">Loading class...</p>;
};

export default StudentMaterialPage;