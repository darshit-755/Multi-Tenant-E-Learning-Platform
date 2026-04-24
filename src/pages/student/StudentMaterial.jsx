import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Play,
  FileText,
  ChevronDown,
  ChevronUp,
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

/* ═══════════════════════════════════════════════════════
   VIEW 3: Class selected — show videos + Resource dropdown
   ═══════════════════════════════════════════════════════ */
const ClassVideoView = ({ cls, batchId }) => {
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
  const {
    data: classesData,
    isLoading: isClassesLoading,
    isError: isClassesError,
  } = useGetMyClasses();
  const { data: batchesData, isLoading: isBatchesLoading } = useGetMyBatches();

  const classes = useMemo(() => classesData?.classes || [], [classesData?.classes]);
  const batches = useMemo(() => batchesData?.batches || [], [batchesData?.batches]);

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

  // VIEW 1: No batch selected — keep the main content unchanged when only opening sidebar.
  if (!batchId) {
    return null;
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

  // VIEW 2: Batch selected, class not selected — do not show a dedicated content page
  if (batchId && !classId) {
    return null;
  }

  // VIEW 3: Batch + class selected
  if (batchId && classId && activeClass) {
    return (
      <ClassVideoView
        cls={activeClass}
        batchId={batchId}
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