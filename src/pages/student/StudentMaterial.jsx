import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetMyClasses } from "@/hooks/student/useGetMyClasses";
import { useGetMyBatches } from "@/hooks/student/useGetMyBatches";
import { getClassNotesApi } from "@/services/classNote.api";
import { formatDateWithDay } from "@/utils/classUtils";

function Tabs({ tabs, active, onTabChange }) {
  return (
    <div className="mb-4 flex border-b">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          className={`px-4 py-2 -mb-px border-b-2 font-medium text-sm focus:outline-none ${
            active === tab
              ? "border-blue-600 text-blue-700"
              : "border-transparent text-slate-500 hover:text-blue-600"
          }`}
          onClick={() => onTabChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

const StudentMaterialPage = () => {
  const navigate = useNavigate();
  const { batchId: batchIdFromRoute } = useParams();
  const { data: classesData, isLoading: isClassesLoading, isError: isClassesError } = useGetMyClasses();
  const { data: batchesData, isLoading: isBatchesLoading } = useGetMyBatches();

  const classes = classesData?.classes || [];
  const batches = batchesData?.batches || [];

  useEffect(() => {
    if (!batchIdFromRoute && batches.length > 0) {
      navigate(`/student/material/${batches[0]._id}`, { replace: true });
    }
  }, [batchIdFromRoute, batches, navigate]);

  const activeBatchId = batchIdFromRoute || batches[0]?._id || "";

  const activeBatch = batches.find((batch) => batch._id === activeBatchId);

  const classesForBatch = useMemo(
    () =>
      classes.filter(
        (cls) => String(cls.batchId?._id || "") === String(activeBatchId),
      ),
    [classes, activeBatchId],
  );

  const [selectedClass, setSelectedClass] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [pdfPreview, setPdfPreview] = useState({
    open: false,
    url: "",
    name: "",
  });
  const [materialTab, setMaterialTab] = useState("Video");

  const notesQueryKey = ["student-material-notes", selectedClass?._id];

  const {
    data: classNotesData,
    isLoading: isNotesLoading,
    isError: isNotesError,
    refetch: refetchNotes,
  } = useQuery({
    queryKey: notesQueryKey,
    queryFn: async () => {
      const { data: responseData } = await getClassNotesApi(selectedClass._id);
      return responseData;
    },
    enabled: Boolean(selectedClass?._id) && isViewDialogOpen,
  });

  const openViewDialog = (cls) => {
    setSelectedClass(cls);
    setIsViewDialogOpen(true);
  };

  const openPdfPreview = ({ url, name }) => {
    if (!url) return;
    setPdfPreview({
      open: true,
      url,
      name: name || "PDF Preview",
    });
  };

  if (isClassesLoading || isBatchesLoading) {
    return <p className="text-sm text-muted-foreground">Loading material...</p>;
  }

  if (isClassesError) {
    return (
      <p className="text-sm text-red-600">
        Failed to load classes for material page.
      </p>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Material</h1>
          <p className="text-sm text-muted-foreground">
            {activeBatch
              ? `Showing material for ${activeBatch.name}`
              : "Choose a batch from the sidebar to view its material."}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/student/dashboard")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Batch Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          {activeBatch ? (
            <>
              <p>
                <span className="font-medium text-slate-800">Batch:</span> {activeBatch.name}
              </p>
              <p>
                <span className="font-medium text-slate-800">Subject:</span>{" "}
                {activeBatch.subjectId?.name || "-"}
              </p>
              <p>
                <span className="font-medium text-slate-800">Tutor:</span>{" "}
                {activeBatch.teacherId?.userId?.name || "-"}
              </p>
            </>
          ) : (
            <p>No batch selected.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          {activeBatchId && classesForBatch.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No classes found for this batch yet.
            </p>
          ) : !activeBatchId ? (
            <p className="text-sm text-muted-foreground">
              Select a batch from the sidebar to start viewing material.
            </p>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Topic</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classesForBatch.map((cls) => (
                    <TableRow key={cls._id}>
                      <TableCell className="font-medium">
                        {cls.topic || "Class Session"}
                      </TableCell>
                      <TableCell>{cls.subjectId?.name || "-"}</TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div>{formatDateWithDay(cls.date)}</div>
                          <div className="text-muted-foreground">
                            {cls.startTime
                              ? `${cls.startTime} (${cls.duration || 0} min)`
                              : "-"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openViewDialog(cls)}
                        >
                          View Material
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isViewDialogOpen}
        onOpenChange={(open) => {
          setIsViewDialogOpen(open);
          if (!open) {
            setSelectedClass(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>View Material</DialogTitle>
            <DialogDescription>
              {selectedClass
                ? `All material for ${selectedClass.topic || "Class Session"}`
                : "Class material"}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto space-y-3">
            {isNotesLoading ? (
              <p className="text-sm text-muted-foreground">Loading material...</p>
            ) : isNotesError ? (
              <div className="space-y-2">
                <p className="text-sm text-red-600">Failed to fetch material.</p>
                <Button variant="outline" size="sm" onClick={() => refetchNotes()}>
                  Retry
                </Button>
              </div>
            ) : (classNotesData?.notes || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No material yet for this class.
              </p>
            ) : (
              <>
                <Tabs
                  tabs={["Video", "PDF"]}
                  active={materialTab}
                  onTabChange={setMaterialTab}
                />
                {materialTab === "Video" ? (
                  (classNotesData?.notes || []).every(
                    (note) => !Array.isArray(note.videos) || note.videos.length === 0,
                  ) ? (
                    <p className="text-xs text-slate-500">
                      No uploaded video recordings.
                    </p>
                  ) : (
                    (classNotesData?.notes || []).map((note) =>
                      Array.isArray(note.videos) && note.videos.length > 0 ? (
                        <div
                          key={note._id + "-videos"}
                          className="rounded-md border p-3 bg-slate-50"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-medium text-slate-900">
                              {note.title || "Class Note"}
                            </h3>
                            <span className="text-xs text-slate-500">
                              {note.createdAt ? new Date(note.createdAt).toLocaleString() : ""}
                            </span>
                          </div>
                          <div className="mt-1 text-xs font-medium text-slate-500">
                            {note.contentType === "videoLecture"
                              ? "Video Lecture"
                              : "Class Note"}
                          </div>
                          {note.lectureLink ? (
                            <div className="mt-3">
                              <a
                                href={note.lectureLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-blue-700 hover:underline"
                              >
                                Open Lecture Link
                              </a>
                            </div>
                          ) : null}
                          <div className="mt-3 space-y-3">
                            <p className="text-xs font-medium text-slate-600">
                              Video Recordings
                            </p>
                            {note.videos.map((video, index) => {
                              const videoUrl = typeof video === "string" ? video : video?.url;
                              const videoName =
                                typeof video === "string"
                                  ? String(video).split("/").pop() || `Video ${index + 1}`
                                  : video?.name ||
                                    String(video?.url || "").split("/").pop() ||
                                    `Video ${index + 1}`;

                              if (!videoUrl) return null;

                              return (
                                <div
                                  key={`${note._id}-video-${index}`}
                                  className="rounded-md border p-2 bg-white"
                                >
                                  <p className="mb-2 text-xs text-slate-700">
                                    {videoName}
                                  </p>
                                  <video
                                    className="w-full rounded-md"
                                    controls
                                    src={videoUrl}
                                    preload="metadata"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : null,
                    )
                  )
                ) : (classNotesData?.notes || []).every(
                    (note) => !Array.isArray(note.pdfs) || note.pdfs.length === 0,
                  ) ? (
                  <p className="text-xs text-slate-500">
                    No PDF attached to any material.
                  </p>
                ) : (
                  (classNotesData?.notes || []).map((note) =>
                    Array.isArray(note.pdfs) && note.pdfs.length > 0 ? (
                      <div
                        key={note._id + "-pdfs"}
                        className="rounded-md border p-3 bg-slate-50"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-medium text-slate-900">
                            {note.title || "Class Note"}
                          </h3>
                          <span className="text-xs text-slate-500">
                            {note.createdAt ? new Date(note.createdAt).toLocaleString() : ""}
                          </span>
                        </div>
                        <div className="mt-1 text-xs font-medium text-slate-500">
                          {note.contentType === "videoLecture"
                            ? "Video Lecture"
                            : "Class Note"}
                        </div>
                        {note.content ? (
                          <p className="mt-2 text-sm whitespace-pre-wrap text-slate-700">
                            {note.content}
                          </p>
                        ) : null}
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-medium text-slate-600">
                            PDF Attachments
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {note.pdfs.map((pdf, index) => {
                              const pdfUrl = typeof pdf === "string" ? pdf : pdf?.url;
                              const pdfName =
                                typeof pdf === "string"
                                  ? String(pdf).split("/").pop() || `PDF ${index + 1}`
                                  : pdf?.name ||
                                    String(pdf?.url || "").split("/").pop() ||
                                    `PDF ${index + 1}`;

                              if (!pdfUrl) return null;

                              return (
                                <Button
                                  key={`${note._id}-pdf-${index}`}
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openPdfPreview({ url: pdfUrl, name: pdfName })}
                                  className="h-auto py-1 text-xs text-blue-700 border-blue-200 hover:bg-blue-50"
                                >
                                  View PDF: {pdfName}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : null,
                  )
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={pdfPreview.open}
        onOpenChange={(open) => setPdfPreview((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>{pdfPreview.name || "PDF Preview"}</DialogTitle>
            <DialogDescription>
              Previewing file inside the dashboard.
            </DialogDescription>
          </DialogHeader>

          <div className="h-[70vh] rounded-md border overflow-hidden bg-slate-100">
            {pdfPreview.url ? (
              <iframe
                title={pdfPreview.name || "PDF Preview"}
                src={pdfPreview.url}
                className="w-full h-full"
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

export default StudentMaterialPage;