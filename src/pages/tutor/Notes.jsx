import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  BookOpen, Video, FileText, Plus, Eye, Calendar, Clock, MoreHorizontal,
  Pencil, Trash2, ExternalLink, FileIcon, Loader2, Inbox,
} from "lucide-react";
import ConfirmActionDialog from "@/components/common/ConfirmActionDialog";
import { useGetMyClasses } from "@/hooks/tutor/useGetMyClasses";
import { addClassNoteApi, getClassNotesApi, deleteClassNoteApi } from "@/services/classNote.api";
import { toast } from "sonner";

export default function TutorNotesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useGetMyClasses();
  const classes = useMemo(() => data?.classes || [], [data]);

  const [selectedClass, setSelectedClass] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [pdfPreview, setPdfPreview] = useState({ open: false, url: "", name: "" });
  const [materialTab, setMaterialTab] = useState("video");
  const [editNoteId, setEditNoteId] = useState(null);
  const [deleteNoteTarget, setDeleteNoteTarget] = useState(null);
  const [isDeletingNote, setIsDeletingNote] = useState(false);

  const {
    register, handleSubmit, reset, watch, setError, clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      contentType: "note", title: "", content: "",
      lectureLink: "", notePdfs: null, lectureVideos: null, pdfFileName: "",
    },
  });

  const watchedContentType = watch("contentType") || "note";
  const watchedPdfFiles = watch("notePdfs");
  const watchedVideoFiles = watch("lectureVideos");
  const selectedPdfFiles = watchedPdfFiles ? Array.from(watchedPdfFiles) : [];
  const selectedVideoFiles = watchedVideoFiles ? Array.from(watchedVideoFiles) : [];

  const notesQueryKey = ["class-notes", selectedClass?._id];

  const {
    data: classNotesData, isLoading: isNotesLoading,
    isError: isNotesError, refetch: refetchNotes,
  } = useQuery({
    queryKey: notesQueryKey,
    queryFn: async () => {
      const { data: responseData } = await getClassNotesApi(selectedClass._id);
      return responseData;
    },
    enabled: Boolean(selectedClass?._id) && (isViewDialogOpen || isAddDialogOpen),
  });

  const handleDeleteNote = (note) => {
    if (!selectedClass?._id || !note?._id) return;
    setDeleteNoteTarget(note);
  };

  const confirmDeleteNote = async () => {
    if (!selectedClass?._id || !deleteNoteTarget?._id) return;
    try {
      setIsDeletingNote(true);
      await deleteClassNoteApi(selectedClass._id, deleteNoteTarget._id);
      toast.success("Material deleted");
      refetchNotes();
      setDeleteNoteTarget(null);
    } catch {
      toast.error("Failed to delete material");
    } finally {
      setIsDeletingNote(false);
    }
  };

  const addNoteMutation = useMutation({
    mutationFn: async (payload) => {
      const { data: responseData } = await addClassNoteApi(selectedClass._id, payload);
      return responseData;
    },
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: notesQueryKey });
      toast.success("Note added successfully");
      setIsAddDialogOpen(false);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to add note");
    },
  });

  const openAddDialog = (cls, contentType = "note", note = null) => {
    setSelectedClass(cls);
    if (note) {
      setEditNoteId(note._id);
      reset({
        contentType: note.contentType,
        title: cls?.topic || "",
        content: note.content || "",
        lectureLink: note.lectureLink || "",
        notePdfs: null,
        lectureVideos: null,
        pdfFileName:
          Array.isArray(note.pdfs) && note.pdfs.length > 0
            ? String(note.pdfs[0]?.name || "")
            : "",
      });
    } else {
      setEditNoteId(null);
      reset({
        contentType, title: cls?.topic || "",
        content: "", lectureLink: "",
        notePdfs: null, lectureVideos: null, pdfFileName: "",
      });
    }
    setIsAddDialogOpen(true);
  };

  const openViewDialog = (cls) => {
    setSelectedClass(cls);
    setIsViewDialogOpen(true);
  };

  const openPdfPreview = ({ url, name }) => {
    if (!url) return;
    setPdfPreview({ open: true, url, name: name || "PDF Preview" });
  };

  const onAddNoteSubmit = (values) => {
    const contentType = values.contentType === "videoLecture" ? "videoLecture" : "note";
    const title = String(values.title || "").trim();
    const content = String(values.content || "").trim();
    const lectureLink = String(values.lectureLink || "").trim();
    const pdfFileName = String(values.pdfFileName || "").trim();
    const files = values.notePdfs ? Array.from(values.notePdfs) : [];
    const videoFiles = values.lectureVideos ? Array.from(values.lectureVideos) : [];

    if (contentType === "note" && !content && files.length === 0) {
      toast.error("Add note content or at least one PDF"); return;
    }
    if (contentType === "videoLecture" && !lectureLink && videoFiles.length === 0) {
      toast.error("Add lecture link or at least one video recording"); return;
    }

    const nonPdfFile = files.find((f) => f.type !== "application/pdf");
    if (nonPdfFile) {
      setError("notePdfs", { type: "validate", message: "Only PDF files are allowed" });
      toast.error("Only PDF files are allowed"); return;
    }
    if (contentType === "note" && files.length > 0 && !pdfFileName) {
      setError("pdfFileName", { type: "validate", message: "PDF file name is required when uploading PDF" });
      toast.error("Add a PDF file name");
      return;
    }
    const nonVideoFile = videoFiles.find((f) => !f.type.startsWith("video/"));
    if (nonVideoFile) {
      setError("lectureVideos", { type: "validate", message: "Only video files are allowed" });
      toast.error("Only video files are allowed"); return;
    }

    clearErrors("notePdfs"); clearErrors("lectureVideos"); clearErrors("pdfFileName");

    const payload = new FormData();
    payload.append("contentType", contentType);
    payload.append("title", title);
    payload.append("content", content);
    payload.append("lectureLink", lectureLink);
    payload.append("pdfFileName", pdfFileName);
    files.forEach((f) => payload.append("notePdfs", f));
    videoFiles.forEach((f) => payload.append("lectureVideos", f));

    if (editNoteId) {
      deleteClassNoteApi(selectedClass._id, editNoteId)
        .then(() => addNoteMutation.mutate(payload))
        .catch(() => toast.error("Failed to replace old material"));
    } else {
      addNoteMutation.mutate(payload);
    }
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
  const hasVideos = notes.some((n) => Array.isArray(n.videos) && n.videos.length > 0 || n.lectureLink);
  const hasPdfs = notes.some((n) => Array.isArray(n.pdfs) && n.pdfs.length > 0 || n.content);

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
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
              Manage notes, PDFs and video lectures for all your classes.
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
                      <TableHead className="text-right font-medium">Actions</TableHead>
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
                              {cls.date || "—"}
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
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              className="h-8 gap-1.5"
                              onClick={() => openAddDialog(cls, "note")}
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Add Material
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1.5"
                              onClick={() => openViewDialog(cls)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
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

      {/* Add / Edit Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            reset({
              contentType: "note", title: "", content: "",
              lectureLink: "", notePdfs: null, lectureVideos: null, pdfFileName: "",
            });
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editNoteId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editNoteId ? "Edit Material" : "Add Material"}
            </DialogTitle>
            <DialogDescription>
              {selectedClass
                ? `For "${selectedClass.topic || "Class Session"}"`
                : "Add content for the class"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onAddNoteSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label>Content Type</Label>
              <Select
                value={watchedContentType}
                onValueChange={(value) => {
                  const nextType = value === "videoLecture" ? "videoLecture" : "note";
                  const currentTitle = watch("title") || selectedClass?.topic || "";
                  reset({
                    contentType: nextType, title: currentTitle, content: "",
                    lectureLink: "", notePdfs: null, lectureVideos: null, pdfFileName: "",
                  });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Class Note
                    </div>
                  </SelectItem>
                  <SelectItem value="videoLecture">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" /> Video Lecture
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter title"
                className="border-2 border-border/80 focus-visible:border-primary"
                {...register("title")}
                readonly="readonly"
              />
            </div>
            {watchedContentType === "note" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="content">Note Content</Label>
                  <Textarea
                    id="content"
                    rows={4}
                    placeholder="Write the note..."
                    {...register("content")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pdf-file-name">PDF File Name</Label>
                  <Input
                    id="pdf-file-name"
                    type="text"
                    placeholder="Enter display name for PDFs"
                    {...register("pdfFileName")}
                  />
                  <p className="text-xs text-muted-foreground">
                    This name is shown to students for uploaded PDFs.
                  </p>
                  {errors.pdfFileName?.message && (
                    <p className="text-xs text-destructive">{errors.pdfFileName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note-pdfs">PDFs</Label>
                  <Input
                    id="note-pdfs"
                    type="file"
                    accept="application/pdf"
                    multiple
                    className="cursor-pointer file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1 file:text-xs file:font-medium"
                    {...register("notePdfs")}
                  />
                  {selectedPdfFiles.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {selectedPdfFiles.length} file{selectedPdfFiles.length > 1 ? "s" : ""} selected
                    </p>
                  )}
                  {errors.notePdfs?.message && (
                    <p className="text-xs text-destructive">{errors.notePdfs.message}</p>
                  )}
                </div>

              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="lecture-link">Lecture Link (optional)</Label>
                  <Input
                    id="lecture-link"
                    type="url"
                    placeholder="https://..."
                    {...register("lectureLink")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lecture-videos">Video Recording (optional)</Label>
                  <Input
                    id="lecture-videos"
                    type="file"
                    accept="video/*"
                    multiple
                    className="cursor-pointer file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1 file:text-xs file:font-medium"
                    {...register("lectureVideos")}
                  />
                  {selectedVideoFiles.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {selectedVideoFiles.length} file{selectedVideoFiles.length > 1 ? "s" : ""} selected
                    </p>
                  )}
                  {errors.lectureVideos?.message && (
                    <p className="text-xs text-destructive">{errors.lectureVideos.message}</p>
                  )}
                </div>
              </>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addNoteMutation.isPending} className="gap-1.5">
                {addNoteMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {addNoteMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Notes Dialog */}
      <Dialog
        open={isViewDialogOpen}
        onOpenChange={(open) => {
          setIsViewDialogOpen(open);
          if (!open) {
            setSelectedClass(null);
            setDeleteNoteTarget(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Class Materials For
              {selectedClass
                ? ` "${selectedClass.topic || "Class Session"}"`
                : "Class notes"}
            </DialogTitle>

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
                    {hasVideos && (
                      <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        {notes.filter((n) => (Array.isArray(n.videos) && n.videos.length > 0) || n.lectureLink).length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="pdf"
                    className="gap-2 rounded-lg text-sm font-medium text-muted-foreground transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  >
                    <FileIcon className="h-4 w-4" />
                    PDFs & Notes
                    {hasPdfs && (
                      <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        {notes.filter((n) => (Array.isArray(n.pdfs) && n.pdfs.length > 0) || n.content).length}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="video" className="mt-4 space-y-3">
                  {!hasVideos ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      No video recordings uploaded.
                    </p>
                  ) : (
                    notes.map((note) =>
                      (Array.isArray(note.videos) && note.videos.length > 0) || note.lectureLink ? (
                        <div
                          key={note._id + "-videos"}
                          className="rounded-xl border bg-card p-4 transition-colors hover:border-primary/30"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="font-medium">{note.title || "Class Note"}</h3>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                {note.createdAt && (
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(note.createdAt).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openAddDialog(selectedClass, note.contentType, note)}>
                                  <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleDeleteNote(note)}
                                >
                                  <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
                      ) : null
                    )
                  )}
                </TabsContent>

                <TabsContent value="pdf" className="mt-4 space-y-3">
                  {!hasPdfs ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      No notes or PDFs available.
                    </p>
                  ) : (
                    notes.map((note) =>
                      (Array.isArray(note.pdfs) && note.pdfs.length > 0) || note.content ? (
                        <div
                          key={note._id + "-pdfs"}
                          className="rounded-xl border bg-card p-4 transition-colors hover:border-primary/30"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="font-medium">{note.title || "Class Note"}</h3>
                              <div className="mt-1 flex flex-wrap items-center gap-2">

                                {note.createdAt && (
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(note.createdAt).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openAddDialog(selectedClass, note.contentType, note)}>
                                  <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleDeleteNote(note)}
                                >
                                  <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {note.content && (
                            <p className="mt-3 whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-sm leading-relaxed">
                              Note: {note.content}
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
                                    <span className="max-w-45 truncate">{pdfName}</span>
                                  </Button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : null
                    )
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmActionDialog
        open={Boolean(deleteNoteTarget)}
        onOpenChange={(open) => { if (!open) setDeleteNoteTarget(null); }}
        title="Delete material?"
        description="This will permanently remove the selected material from the class notes."
        confirmText="Delete"
        onConfirm={confirmDeleteNote}
        isConfirming={isDeletingNote}
      />

      <Dialog
        open={pdfPreview.open}
        onOpenChange={(open) => setPdfPreview((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileIcon className="h-4 w-4 text-primary" />
              {pdfPreview.name || "PDF Preview"}
            </DialogTitle>
            <DialogDescription>Previewing file inside the dashboard.</DialogDescription>
          </DialogHeader>
          <div className="aspect-video overflow-hidden rounded-lg border bg-muted/30">
            {pdfPreview.url ? (
              <iframe
                title={pdfPreview.name || "PDF Preview"}
                src={pdfPreview.url}
                className="h-full w-full"
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
