import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetMyClasses } from "@/hooks/tutor/useGetMyClasses";
import { addClassNoteApi, getClassNotesApi } from "@/services/classNote.api";
import { toast } from "sonner";

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
      title: "",
      content: "",
      notePdfs: null,
    },
  });

  const watchedPdfFiles = watch("notePdfs");
  const selectedPdfFiles = watchedPdfFiles ? Array.from(watchedPdfFiles) : [];

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

  const openAddDialog = (cls) => {
    setSelectedClass(cls);
    reset();
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
    const title = String(values.title || "").trim();
    const content = String(values.content || "").trim();
    const files = values.notePdfs ? Array.from(values.notePdfs) : [];

    if (!content && files.length === 0) {
      toast.error("Add note content or at least one PDF");
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

    clearErrors("notePdfs");

    const payload = new FormData();
    payload.append("title", title);
    payload.append("content", content);
    files.forEach((file) => payload.append("notePdfs", file));

    addNoteMutation.mutate(payload);
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
                          <Button size="sm" onClick={() => openAddDialog(cls)}>
                            Add Note
                          </Button>
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
            reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              {selectedClass
                ? `Add note for ${selectedClass.topic || "Class Session"}`
                : "Add note"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onAddNoteSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="note-title">Title (optional)</Label>
              <Input
                id="note-title"
                placeholder="e.g. Key formulas"
                {...register("title")}
              />
            </div>

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

            <DialogFooter>
              <Button type="submit" disabled={addNoteMutation.isPending}>
                {addNoteMutation.isPending ? "Saving..." : "Save Note"}
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
              (classNotesData?.notes || []).map((note) => (
                <div key={note._id} className="rounded-md border p-3 bg-slate-50">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium text-slate-900">{note.title || "Class Note"}</h3>
                    <span className="text-xs text-slate-500">
                      {note.createdAt
                        ? new Date(note.createdAt).toLocaleString()
                        : ""}
                    </span>
                  </div>
                  {note.content ? (
                    <p className="mt-2 text-sm whitespace-pre-wrap text-slate-700">{note.content}</p>
                  ) : null}

                  {Array.isArray(note.pdfs) && note.pdfs.length > 0 ? (
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
                  ) : (
                    <p className="mt-3 text-xs text-slate-500">No PDF attached to this note.</p>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

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
