import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetMyClasses } from "@/hooks/student/useGetMyClasses";
import { getClassNotesApi } from "@/services/classNote.api";
import { formatDateWithDay } from "@/utils/classUtils";

export default function StudentNotesPage() {
  const { data, isLoading, isError } = useGetMyClasses();
  const classes = useMemo(() => data?.classes || [], [data]);

  const [selectedClass, setSelectedClass] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [pdfPreview, setPdfPreview] = useState({
    open: false,
    url: "",
    name: "",
  });

  const notesQueryKey = ["student-class-notes", selectedClass?._id];

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
                          View Notes
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
