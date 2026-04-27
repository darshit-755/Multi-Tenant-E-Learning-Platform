import { useMemo, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Play,
  FileText,
  Maximize2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetMyClasses } from "@/hooks/student/useGetMyClasses";
import { useGetMyBatches } from "@/hooks/student/useGetMyBatches";
import { getClassNotesApi } from "@/services/classNote.api";
import { useVideoProgress } from "@/contexts/VideoProgressContext";


/* ═══════════════════════════════════════════════════════
   VIEW 3: Class selected — show videos + Resource dropdown
   ═══════════════════════════════════════════════════════ */
const ClassVideoView = ({ cls, selectedPdf, onBackToVideos }) => {
  const pdfPreviewRef = useRef(null);
  const { updateProgress, getClassProgress, getVideoProgress } = useVideoProgress();

  const classProgress = getClassProgress(cls?._id);

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

  const handleTimeUpdate = useCallback(
    (videoKey, event) => {
      const videoEl = event.target;
      if (!videoEl.duration || !cls?._id) return;
      const percent = (videoEl.currentTime / videoEl.duration) * 100;
      updateProgress(cls._id, videoKey, percent);
    },
    [cls?._id, updateProgress]
  );

  const openPdfFullscreen = () => {
    if (!selectedPdf?.url) return;
    const container = pdfPreviewRef.current;
    if (container?.requestFullscreen) {
      container.requestFullscreen().catch(() => {
        window.open(selectedPdf.url, "_blank", "noopener,noreferrer");
      });
      return;
    }
    window.open(selectedPdf.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-shrink-0 pb-1">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-slate-800">
            {cls?.topic || "Class Session"}
          </h1>

        </div>
      </div>

      {/* Main content: show only one at a time */}
      {selectedPdf ? (
        <Card className="flex-1 flex flex-col min-h-0 py-0 gap-0">
          <CardHeader className="py-2.5 px-4 flex-shrink-0 border-b">
            <CardTitle className="text-base flex items-center justify-between mb-0">
              <span className="flex items-center gap-2">
                <FileText size={16} className="text-emerald-600" />
                {selectedPdf.name}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onBackToVideos}
                >
                  Back to Videos
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={openPdfFullscreen}
                  className="h-8 gap-1.5"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  Full Screen
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-3 flex-1 min-h-0 overflow-y-auto">
            <div ref={pdfPreviewRef} className="h-full rounded-md border overflow-hidden bg-slate-100">
              <iframe
                title={selectedPdf.name || "PDF Preview"}
                src={selectedPdf.url}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="flex-1 flex flex-col min-h-0 py-0 gap-0">
          <CardHeader className="py-2.5 px-4 flex-shrink-0 border-b">
            <CardTitle className="text-base flex items-center gap-1.5 mb-0">
              <Play size={16} className="text-blue-600" />
              Video Recordings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-3 flex-1 min-h-0 overflow-y-auto">
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
              <div className="flex flex-col gap-3 h-full">
                {allVideos.map((video, idx) => {
                  const videoKey = `${video.noteId}-${video.index}`;
                  const isSingleVideo = allVideos.filter(v => !v.isLink).length === 1 && !video.isLink;
                  return (
                    <div
                      key={videoKey}
                      className={`space-y-1 ${isSingleVideo ? "flex-1 flex flex-col min-h-0" : ""}`}
                    >
                      <p className="text-sm font-medium text-slate-700 flex-shrink-0">
                        {video.name}
                      </p>
                      {video.isLink ? (
                        <div>
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors"
                          >
                            <Play size={16} className="text-blue-600 shrink-0" />
                            <span className="text-sm font-medium text-blue-900 truncate">
                              {video.url}
                            </span>
                            <span className="text-xs text-blue-700 ml-auto shrink-0">
                              Open →
                            </span>
                          </a>
                          <p className="text-[11px] text-slate-400 mt-0.5 italic">
                            Progress tracking not available for external links
                          </p>
                        </div>
                      ) : (
                        <div className={`${isSingleVideo ? "flex-1 flex flex-col min-h-0" : ""}`}>
                          <div className={`${isSingleVideo ? "flex-1 min-h-0" : "aspect-video"} rounded-lg overflow-hidden border bg-black`}>
                            <video
                              className="h-full w-full"
                              controls
                              src={video.url}
                              preload="metadata"
                              onTimeUpdate={(e) => handleTimeUpdate(videoKey, e)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   Main Page — routes to the correct view
   ═══════════════════════════════════════════════════════ */
const StudentMaterialPage = () => {
  const { batchId, classId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
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

  const selectedPdf = useMemo(() => {
    if (searchParams.get("view") !== "pdf") return null;

    const url = searchParams.get("pdf") || "";
    if (!url) return null;

    return {
      url,
      name: searchParams.get("name") || "PDF Preview",
    };
  }, [searchParams]);

  const showVideosView = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("view");
    nextParams.delete("pdf");
    nextParams.delete("name");
    setSearchParams(nextParams);
  };

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
        selectedPdf={selectedPdf}
        onBackToVideos={showVideosView}
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