
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ConfirmActionDialog from "@/components/common/ConfirmActionDialog";
import { useGetMyClasses } from "@/hooks/tutor/useGetMyClasses";
import { addClassNoteApi, getClassNotesApi, deleteClassNoteApi } from "@/services/classNote.api";
import { toast } from "sonner";

// Simple Tabs component for local use
function Tabs({ tabs, active, onTabChange }) {
  return (
    <div className="mb-4 flex border-b">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`px-4 py-2 -mb-px border-b-2 font-medium text-sm focus:outline-none ${
            active === tab
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-blue-600'
          }`}
          onClick={() => onTabChange(tab)}
          type="button"
        >
          {tab}
        </button>
      ))}
    </div>
  );
}


export default function TutorNotesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useGetMyClasses();
  const classes = useMemo(() => data?.classes || [], [data]);

  const [selectedClass, setSelectedClass] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [pdfPreview, setPdfPreview] = useState({
    open: false,
    url: "",
    name: "",
  });
  const [materialTab, setMaterialTab] = useState("Video");
  const [editNoteId, setEditNoteId] = useState(null);
  const [deleteNoteTarget, setDeleteNoteTarget] = useState(null);
  const [isDeletingNote, setIsDeletingNote] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      contentType: "note",
      title: "",
      content: "",
      lectureLink: "",
      notePdfs: null,
      lectureVideos: null,
    },
  });

  const watchedContentType = watch("contentType") || "note";
  const watchedPdfFiles = watch("notePdfs");
  const watchedVideoFiles = watch("lectureVideos");
  const selectedPdfFiles = watchedPdfFiles ? Array.from(watchedPdfFiles) : [];
  const selectedVideoFiles = watchedVideoFiles ? Array.from(watchedVideoFiles) : [];

  const notesQueryKey = ["class-notes", selectedClass?._id];

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
    enabled: Boolean(selectedClass?._id) && (isViewDialogOpen || isAddDialogOpen),
  });

  // Delete note handler (must be at component level, not inside another function)
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
      // Editing existing note
      setEditNoteId(note._id);
      reset({
        contentType: note.contentType,
        title: cls?.topic || "",
        content: note.content || "",
        lectureLink: note.lectureLink || "",
        notePdfs: null,
        lectureVideos: null,
      });
    } else {
      setEditNoteId(null);
      reset({
        contentType,
        title: cls?.topic || "",
        content: "",
        lectureLink: "",
        notePdfs: null,
        lectureVideos: null,
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
    setPdfPreview({
      open: true,
      url,
      name: name || "PDF Preview",
    });
  };

  const onAddNoteSubmit = (values) => {
    const contentType = values.contentType === "videoLecture" ? "videoLecture" : "note";
    const title = String(values.title || "").trim();
    const content = String(values.content || "").trim();
    const lectureLink = String(values.lectureLink || "").trim();
    const files = values.notePdfs ? Array.from(values.notePdfs) : [];
    const videoFiles = values.lectureVideos ? Array.from(values.lectureVideos) : [];

    if (contentType === "note" && !content && files.length === 0) {
      toast.error("Add note content or at least one PDF");
      return;
    }

    if (contentType === "videoLecture" && !lectureLink && videoFiles.length === 0) {
      toast.error("Add lecture link or at least one video recording");
      return;
    }

    const nonPdfFile = files.find((file) => file.type !== "application/pdf");
    if (nonPdfFile) {
      setError("notePdfs", {
        type: "validate",
        message: "Only PDF files are allowed",
      });
      toast.error("Only PDF files are allowed");
      return;
    }

    const nonVideoFile = videoFiles.find((file) => !file.type.startsWith("video/"));
    if (nonVideoFile) {
      setError("lectureVideos", {
        type: "validate",
        message: "Only video files are allowed",
      });
      toast.error("Only video files are allowed");
      return;
    }

    clearErrors("notePdfs");
    clearErrors("lectureVideos");

    const payload = new FormData();
    payload.append("contentType", contentType);
    payload.append("title", title);
    payload.append("content", content);
    payload.append("lectureLink", lectureLink);
    files.forEach((file) => payload.append("notePdfs", file));
    videoFiles.forEach((file) => payload.append("lectureVideos", file));

    // If editing, delete the old note first, then add new
    if (editNoteId) {
      deleteClassNoteApi(selectedClass._id, editNoteId)
        .then(() => {
          addNoteMutation.mutate(payload);
        })
        .catch(() => {
          toast.error("Failed to replace old material");
        });
    } else {
      addNoteMutation.mutate(payload);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading classes...</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-red-600">
        Failed to load classes for notes page.
      </p>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold text-slate-800">Class Notes</h1>

      <Card>
        <CardContent className="p-4">
          {classes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No classes found. Notes will appear once classes are assigned.
            </p>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Topic</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((cls) => (
                    <TableRow key={cls._id}>
                      <TableCell className="font-medium">{cls.topic || "Class Session"}</TableCell>
                      <TableCell>{cls.subjectId?.name || "-"}</TableCell>
                      <TableCell>{cls.batchId?.name || "-"}</TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div>{cls.date || "-"}</div>
                          <div className="text-muted-foreground">
                            {cls.startTime
                              ? `${cls.startTime} (${cls.duration || 0} min)`
                              : "-"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm">Add Material</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem onClick={() => openAddDialog(cls, "note")}>
                                Add Note
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openAddDialog(cls, "videoLecture")}>
                                Add Video Lecture
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openViewDialog(cls)}
                          >
                            View Note
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

      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            reset({
              contentType: "note",
              title: "",
              content: "",
              lectureLink: "",
              notePdfs: null,
              lectureVideos: null,
            });
          }
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Content</DialogTitle>
            <DialogDescription>
              {selectedClass
                ? `Add content for ${selectedClass.topic || "Class Session"}`
                : "Add content"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onAddNoteSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content-type">Content Type</Label>
              <Select
                value={watchedContentType}
                onValueChange={(value) => {
                  const nextType = value === "videoLecture" ? "videoLecture" : "note";
                  reset({
                    contentType: nextType,
                    title: "",
                    content: "",
                    lectureLink: "",
                    notePdfs: null,
                    lectureVideos: null,
                  });
                }}
              >
                <SelectTrigger id="content-type" className="w-full">
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">Class Note</SelectItem>
                  <SelectItem value="videoLecture">Video Lecture</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note-title">Title</Label>
              <Input
                id="note-title"
                value={selectedClass?.topic || ""}
                readOnly
                {...register("title")}
              />
            </div>

            {watchedContentType === "note" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="note-content">Note Content</Label>
                  <textarea
                    id="note-content"
                    className="w-full min-h-32 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Write your class note here..."
                    {...register("content")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note-pdfs">PDFs (optional)</Label>
                  <Input
                    id="note-pdfs"
                    type="file"
                    accept="application/pdf"
                    multiple
                    {...register("notePdfs")}
                  />
                  {selectedPdfFiles.length > 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Selected: {selectedPdfFiles.map((file) => file.name).join(", ")}
                    </p>
                  ) : null}
                  {errors.notePdfs?.message ? (
                    <p className="text-xs text-red-600">{errors.notePdfs.message}</p>
                  ) : null}
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
                    {...register("lectureVideos")}
                  />
                  {selectedVideoFiles.length > 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Selected: {selectedVideoFiles.map((file) => file.name).join(", ")}
                    </p>
                  ) : null}
                  {errors.lectureVideos?.message ? (
                    <p className="text-xs text-red-600">{errors.lectureVideos.message}</p>
                  ) : null}
                </div>
              </>
            )}

            <DialogFooter>
              <Button type="submit" disabled={addNoteMutation.isPending}>
                {addNoteMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
            <DialogTitle>View Notes</DialogTitle>
            <DialogDescription>
              {selectedClass
                ? `All notes for ${selectedClass.topic || "Class Session"}`
                : "Class notes"}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto space-y-3">
            {isNotesLoading ? (
              <p className="text-sm text-muted-foreground">Loading notes...</p>
            ) : isNotesError ? (
              <div className="space-y-2">
                <p className="text-sm text-red-600">Failed to fetch notes.</p>
                <Button variant="outline" size="sm" onClick={() => refetchNotes()}>
                  Retry
                </Button>
              </div>
            ) : (classNotesData?.notes || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No notes yet for this class.
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
                    (note) => !Array.isArray(note.videos) || note.videos.length === 0
                  ) ? (
                    <p className="text-xs text-slate-500">No uploaded video recordings.</p>
                  ) : (
                    (classNotesData?.notes || []).map((note) =>
                      Array.isArray(note.videos) && note.videos.length > 0 ? (
                        <div key={note._id + "-videos"} className="rounded-md border p-3 bg-slate-50">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-medium text-slate-900">{note.title || "Class Note"}</h3>
                            <span className="text-xs text-slate-500">
                              {note.createdAt ? new Date(note.createdAt).toLocaleString() : ""}
                            </span>
                          </div>
                          <div className="flex gap-2 my-2 justify-end">
                            <Button size="xs" variant="outline" onClick={() => openAddDialog(selectedClass, note.contentType, note)}>Edit</Button>
                            <Button size="xs" variant="destructive" onClick={() => handleDeleteNote(note)}>Delete</Button>
                          </div>
                          <div className="mt-1 text-xs font-medium text-slate-500">
                            {note.contentType === "videoLecture" ? "Video Lecture" : "Class Note"}
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
                            <p className="text-xs font-medium text-slate-600">Video Recordings</p>
                            {note.videos.map((video, index) => {
                              const videoUrl = typeof video === "string" ? video : video?.url;
                              const videoName =
                                typeof video === "string"
                                  ? String(video).split("/").pop() || `Video ${index + 1}`
                                  : video?.name || String(video?.url || "").split("/").pop() || `Video ${index + 1}`;
                              if (!videoUrl) return null;
                              return (
                                <div key={`${note._id}-video-${index}`} className="rounded-md border p-2 bg-white">
                                  <p className="mb-2 text-xs text-slate-700">{videoName}</p>
                                  <video className="w-full rounded-md" controls src={videoUrl} preload="metadata" />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : null
                    )
                  )
                ) : (
                  (classNotesData?.notes || []).every(
                    (note) => !Array.isArray(note.pdfs) || note.pdfs.length === 0
                  ) ? (
                    <p className="text-xs text-slate-500">No PDF attached to any note.</p>
                  ) : (
                    (classNotesData?.notes || []).map((note) =>
                      Array.isArray(note.pdfs) && note.pdfs.length > 0 ? (
                        <div key={note._id + "-pdfs"} className="rounded-md border p-3 bg-slate-50">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-medium text-slate-900">{note.title || "Class Note"}</h3>
                            <span className="text-xs text-slate-500">
                              {note.createdAt ? new Date(note.createdAt).toLocaleString() : ""}
                            </span>
                          </div>
                          <div className="flex gap-2 my-2 justify-end">
                            <Button size="xs" variant="outline" onClick={() => openAddDialog(selectedClass, note.contentType, note)}>Edit</Button>
                            <Button size="xs" variant="destructive" onClick={() => handleDeleteNote(note)}>Delete</Button>
                          </div>
                          <div className="mt-1 text-xs font-medium text-slate-500">
                            {note.contentType === "videoLecture" ? "Video Lecture" : "Class Note"}
                          </div>
                          {note.content ? (
                            <p className="mt-2 text-sm whitespace-pre-wrap text-slate-700">{note.content}</p>
                          ) : null}
                          <div className="mt-3 space-y-2">
                            <p className="text-xs font-medium text-slate-600">PDF Attachments</p>
                            <div className="flex flex-wrap gap-2">
                              {note.pdfs.map((pdf, index) => {
                                const pdfUrl = typeof pdf === "string" ? pdf : pdf?.url;
                                const pdfName =
                                  typeof pdf === "string"
                                    ? String(pdf).split("/").pop() || `PDF ${index + 1}`
                                    : pdf?.name || String(pdf?.url || "").split("/").pop() || `PDF ${index + 1}`;
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
                      ) : null
                    )
                  )
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmActionDialog
        open={Boolean(deleteNoteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteNoteTarget(null);
        }}
        title="Delete note?"
        description="This will permanently remove the selected material from the class notes."
        confirmText="Delete"
        onConfirm={confirmDeleteNote}
        isConfirming={isDeletingNote}
      />

      <Dialog
        open={pdfPreview.open}
        onOpenChange={(open) =>
          setPdfPreview((prev) => ({ ...prev, open }))
        }
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
              <p className="p-4 text-sm text-muted-foreground">No file selected.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
