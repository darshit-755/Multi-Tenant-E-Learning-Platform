import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  BookOpen, Video, FileText, Eye, Calendar, Clock, ExternalLink,
  FileIcon, Loader2, Inbox, Maximize2,
} from "lucide-react";
import { useGetMyClasses } from "@/hooks/student/useGetMyClasses";
import { getClassNotesApi } from "@/services/classNote.api";
import { formatDateWithDay } from "@/utils/classUtils";

export default function StudentNotesPage() {
  const { data, isLoading, isError } = useGetMyClasses();
  const classes = useMemo(() => data?.classes || [], [data]);

  const [selectedClass, setSelectedClass] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [pdfPreview, setPdfPreview] = useState({ open: false, url: "", name: "" });
  const pdfPreviewRef = useRef(null);
  const [materialTab, setMaterialTab] = useState("video");

  const notesQueryKey = ["student-class-notes", selectedClass?._id];

  const {
    data: classNotesData, isLoading: isNotesLoading,
    isError: isNotesError, refetch: refetchNotes,
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

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading classes...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-md mt-20 rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
        <p className="text-sm text-destructive">Failed to load classes for notes page.</p>
      </div>
    );
  }

  const notes = classNotesData?.notes || [];
  const videoNotes = notes.filter((n) => (Array.isArray(n.videos) && n.videos.length > 0) || n.lectureLink);
  const pdfNotes = notes.filter((n) => (Array.isArray(n.pdfs) && n.pdfs.length > 0) || n.content);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">Class Notes</h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse notes, PDFs and video lectures shared by your tutors.
            </p>
          </div>
          <Badge variant="secondary" className="w-fit gap-1.5 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {classes.length} {classes.length === 1 ? "class" : "classes"}
          </Badge>
        </div>

        {/* Main card */}
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-0">
            {classes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <Inbox className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-base font-medium">No classes yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Notes will appear once classes are assigned.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="font-medium">Topic</TableHead>
                      <TableHead className="font-medium">Subject</TableHead>
                      <TableHead className="font-medium">Batch</TableHead>
                      <TableHead className="font-medium">Schedule</TableHead>
                      <TableHead className="text-right font-medium">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classes.map((cls) => (
                      <TableRow key={cls._id} className="group">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                              <FileText className="h-4 w-4" />
                            </div>
                            <span className="font-medium">{cls.topic || "Class Session"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {cls.subjectId?.name || "—"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {cls.batchId?.name || "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5 text-sm">
                            <div className="flex items-center gap-1.5 text-foreground">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              {formatDateWithDay(cls.date)}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {cls.startTime
                                ? `${cls.startTime} · ${cls.duration || 0} min`
                                : "—"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1.5"
                              onClick={() => openViewDialog(cls)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View Material
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Notes Dialog */}
      <Dialog
        open={isViewDialogOpen}
        onOpenChange={(open) => {
          setIsViewDialogOpen(open);
          if (!open) setSelectedClass(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Class Materials</DialogTitle>
            <DialogDescription>
              {selectedClass
                ? `All materials for "${selectedClass.topic || "Class Session"}"`
                : "Class notes"}
            </DialogDescription>
          </DialogHeader>

          <div className="h-[65vh] overflow-y-auto pr-1">
            {isNotesLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span className="text-sm">Loading notes...</span>
              </div>
            ) : isNotesError ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-center">
                <p className="text-sm text-destructive">Failed to fetch notes.</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => refetchNotes()}>
                  Retry
                </Button>
              </div>
            ) : notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Inbox className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  No materials yet for this class.
                </p>
              </div>
            ) : (
              <Tabs value={materialTab} onValueChange={setMaterialTab} className="w-full">
                <TabsList className="grid h-11 w-full grid-cols-2 rounded-xl bg-muted/60 p-1">
                  <TabsTrigger
                    value="video"
                    className="gap-2 rounded-lg text-sm font-medium text-muted-foreground transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  >
                    <Video className="h-4 w-4" />
                    Videos
                    {videoNotes.length > 0 && (
                      <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        {videoNotes.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="pdf"
                    className="gap-2 rounded-lg text-sm font-medium text-muted-foreground transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  >
                    <FileIcon className="h-4 w-4" />
                    PDFs & Notes
                    {pdfNotes.length > 0 && (
                      <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        {pdfNotes.length}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="video" className="mt-4 space-y-3">
                  {videoNotes.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      No video recordings uploaded.
                    </p>
                  ) : (
                    videoNotes.map((note) => (
                      <div
                        key={note._id + "-videos"}
                        className="rounded-xl border bg-card p-4 transition-colors hover:border-primary/30"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-medium">{note.title || "Class Note"}</h3>
                          {note.createdAt && (
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(note.createdAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                       

                        {note.lectureLink && (
                          <a
                            href={note.lectureLink}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" /> Open Lecture Link
                          </a>
                        )}

                        {Array.isArray(note.videos) && note.videos.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {note.videos.map((video, index) => {
                              const videoUrl = typeof video === "string" ? video : video?.url;
                              if (!videoUrl) return null;
                              const videoName =
                                typeof video === "string"
                                  ? String(video).split("/").pop() || `Video ${index + 1}`
                                  : video?.name || String(video?.url || "").split("/").pop() || `Video ${index + 1}`;
                              return (
                                <div key={`${note._id}-video-${index}`} className="aspect-video overflow-hidden rounded-lg border bg-background">
                                  <video className="h-full w-full" controls src={videoUrl} preload="metadata" />
                                  <p className="px-3 py-2 text-xs text-muted-foreground truncate">{videoName}</p>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="pdf" className="mt-4 space-y-3">
                  {pdfNotes.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      No notes or PDFs available.
                    </p>
                  ) : (
                    pdfNotes.map((note) => (
                      <div
                        key={note._id + "-pdfs"}
                        className="rounded-xl border bg-card p-4 transition-colors hover:border-primary/30"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-medium">{note.title || "Class Note"}</h3>
                          {note.createdAt && (
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(note.createdAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                        

                        {note.content && (
                          <p className="mt-3 whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-sm leading-relaxed">
                            Note : {note.content}
                          </p>
                        )}

                        {Array.isArray(note.pdfs) && note.pdfs.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {note.pdfs.map((pdf, index) => {
                              const pdfUrl = typeof pdf === "string" ? pdf : pdf?.url;
                              if (!pdfUrl) return null;
                              const pdfName =
                                typeof pdf === "string"
                                  ? String(pdf).split("/").pop() || `PDF ${index + 1}`
                                  : pdf?.name || String(pdf?.url || "").split("/").pop() || `PDF ${index + 1}`;
                              return (
                                <Button
                                  key={`${note._id}-pdf-${index}`}
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openPdfPreview({ url: pdfUrl, name: pdfName })}
                                  className="h-8 gap-1.5 text-xs"
                                >
                                  <FileIcon className="h-3.5 w-3.5 text-primary" />
                                  <span className="max-w-[180px] truncate">{pdfName}</span>
                                </Button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* PDF Preview Dialog */}
      <Dialog
        open={pdfPreview.open}
        onOpenChange={(open) => setPdfPreview((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileIcon className="h-4 w-4 text-primary" />
              {pdfPreview.name || "PDF Preview"}
            </DialogTitle>
            <DialogDescription>Previewing file inside the dashboard.</DialogDescription>
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
          <div ref={pdfPreviewRef} className="h-[50vh] overflow-hidden rounded-lg border bg-muted/30">
            {pdfPreview.url ? (
              <iframe
                title={pdfPreview.name || "PDF Preview"}
                src={pdfPreview.url}
                className="h-full w-full"
                allowFullScreen
              />
            ) : (
              <p className="p-4 text-sm text-muted-foreground">No file selected.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
