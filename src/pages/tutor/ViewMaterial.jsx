import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Loader2,
  AlertTriangle,
  Calendar,
  Clock,
  FileText,
  Video,
  ExternalLink,
  PlayCircle,
  Inbox,
  BookOpen,
  Search,
  Sparkles,
  GraduationCap,
  Users,
  Download,
  Eye,
  X,
} from "lucide-react";
import { useGetMyClasses } from "@/hooks/tutor/useGetMyClasses";
import { getClassNotesApi } from "@/services/classNote.api";
import { formatDateWithDay } from "@/utils/classUtils";

/* -------------------- Local Tabs -------------------- */
function Tabs({ tabs, active, onTabChange, counts = {} }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-2xl border border-border/60 bg-muted/60 p-1.5 backdrop-blur">
      {tabs.map((tab) => {
        const isActive = active === tab;
        const count = counts[tab];
        return (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            type="button"
            className={[
              "group relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-background text-foreground shadow-md shadow-black/5 ring-1 ring-border/60"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {tab === "Video" ? (
              <Video className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} />
            ) : (
              <FileText className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} />
            )}
            <span>{tab}</span>
            {typeof count === "number" && (
              <span
                className={[
                  "ml-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "bg-background text-muted-foreground",
                ].join(" ")}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* -------------------- Stat Pill -------------------- */
function StatPill({ icon: Icon, label, value, tone = "primary" }) {
  const tones = {
    primary: "from-primary/10 to-primary/5 text-primary",
    blue: "from-blue-500/10 to-blue-500/5 text-blue-600 dark:text-blue-400",
    emerald:
      "from-emerald-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-400",
  };
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border border-border/60 bg-gradient-to-br ${tones[tone]} px-4 py-3 backdrop-blur-sm transition-all hover:shadow-md`}
    >
      <div className="rounded-xl bg-background/80 p-2 shadow-sm">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-lg font-bold leading-tight text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function ViewMaterialPage() {
  const { data, isLoading, isError } = useGetMyClasses();
  const classes = useMemo(() => data?.classes || [], [data]);

  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [pdfPreview, setPdfPreview] = useState({ open: false, url: "", name: "" });
  const [materialTab, setMaterialTab] = useState("Video");

  const filteredClasses = useMemo(() => {
    if (!search.trim()) return classes;
    const q = search.toLowerCase();
    return classes.filter(
      (c) =>
        (c.topic || "").toLowerCase().includes(q) ||
        (c.subjectId?.name || "").toLowerCase().includes(q) ||
        (c.batchId?.name || "").toLowerCase().includes(q)
    );
  }, [classes, search]);

  const uniqueSubjects = useMemo(
    () => new Set(classes.map((c) => c.subjectId?.name).filter(Boolean)).size,
    [classes]
  );
  const uniqueBatches = useMemo(
    () => new Set(classes.map((c) => c.batchId?.name).filter(Boolean)).size,
    [classes]
  );

  const notesQueryKey = ["tutor-class-notes", selectedClass?._id];

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

  const notes = classNotesData?.notes || [];
  const videoCount = notes.reduce(
    (n, note) => n + (Array.isArray(note.videos) ? note.videos.length : 0),
    0
  );
  const pdfCount = notes.reduce(
    (n, note) => n + (Array.isArray(note.pdfs) ? note.pdfs.length : 0),
    0
  );

  const openViewDialog = (cls) => {
    setSelectedClass(cls);
    setIsViewDialogOpen(true);
  };

  const openPdfPreview = ({ url, name }) => {
    if (!url) return;
    setPdfPreview({ open: true, url, name: name || "PDF Preview" });
  };

  /* -------------------- Loading -------------------- */
  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-14 w-14 rounded-full border-4 border-primary/20" />
            <div className="absolute inset-0 h-14 w-14 animate-spin rounded-full border-4 border-transparent border-t-primary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Loading your classes...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl border border-destructive/20 bg-gradient-to-br from-destructive/10 to-destructive/5 p-8 text-center">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-destructive">
              Something went wrong
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Failed to load classes for material page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------- Page -------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 via-background to-background">
      {/* Decorative top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 md:px-8 md:py-10">
        {/* Header */}
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Tutor Dashboard
              </div>
              <h1 className="bg-gradient-to-br from-foreground via-foreground to-foreground/60 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl">
                View Material
              </h1>
              <p className="max-w-xl text-sm text-muted-foreground md:text-base">
                Browse class recordings, lecture links and PDF resources for all
                your scheduled sessions.
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search topic, subject or batch..."
                className="h-11 rounded-xl border-border/60 bg-background/80 pl-9 shadow-sm backdrop-blur"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatPill
              icon={GraduationCap}
              label="Total Classes"
              value={classes.length}
              tone="primary"
            />
            <StatPill
              icon={BookOpen}
              label="Subjects"
              value={uniqueSubjects}
              tone="blue"
            />
            <StatPill
              icon={Users}
              label="Batches"
              value={uniqueBatches}
              tone="emerald"
            />
          </div>
        </div>

        {/* Table card */}
        <Card className="overflow-hidden rounded-2xl border-border/60 bg-card/60 shadow-xl shadow-black/5 backdrop-blur-sm">
          <CardContent className="p-0">
            {filteredClasses.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
                <div className="rounded-2xl bg-gradient-to-br from-muted to-muted/50 p-5">
                  <Inbox className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {search ? "No matches found" : "No classes yet"}
                  </h3>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    {search
                      ? "Try a different search keyword."
                      : "Material will appear here once your classes are created."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/60 bg-muted/40 hover:bg-muted/40">
                      <TableHead className="py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Topic
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Subject
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Batch
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Schedule
                      </TableHead>
                      <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClasses.map((cls) => (
                      <TableRow
                        key={cls._id}
                        className="group border-border/40 transition-colors hover:bg-muted/30"
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-primary/10">
                              <BookOpen className="h-4 w-4" />
                            </div>
                            <div className="font-semibold text-foreground">
                              {cls.topic || "Class Session"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/60">
                            {cls.subjectId?.name || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/60">
                            {cls.batchId?.name || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 text-sm">
                            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              {formatDateWithDay(cls.date)}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              {cls.startTime
                                ? `${cls.startTime} · ${cls.duration || 0} min`
                                : "-"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => openViewDialog(cls)}
                            className="gap-1.5 rounded-xl bg-gradient-to-br from-primary to-primary/90 shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 group-hover:scale-[1.02]"
                          >
                            <Eye className="h-3.5 w-3.5" />
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

        {/* View Material Dialog */}
        <Dialog
          open={isViewDialogOpen}
          onOpenChange={(open) => {
            setIsViewDialogOpen(open);
            if (!open) setSelectedClass(null);
          }}
        >
          <DialogContent className="max-h-[92vh] max-w-3xl overflow-hidden rounded-2xl p-0">
            <DialogHeader className="border-b border-border/60 bg-gradient-to-br from-primary/10 via-muted/40 to-background px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-background/80 p-2 shadow-sm ring-1 ring-border/60">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-xl">
                    {selectedClass?.topic || "Class Material"}
                  </DialogTitle>
                  <DialogDescription className="mt-1">
                    {selectedClass
                      ? `Recordings, links and PDFs for this class`
                      : "Class material"}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="max-h-[calc(92vh-120px)] space-y-5 overflow-y-auto px-6 py-5">
              {isNotesLoading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading material...
                </div>
              ) : isNotesError ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                  <p className="text-sm text-destructive">
                    Failed to fetch material.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => refetchNotes()}
                    className="rounded-xl"
                  >
                    Retry
                  </Button>
                </div>
              ) : notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <div className="rounded-2xl bg-muted p-4">
                    <Inbox className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No material yet for this class.
                  </p>
                </div>
              ) : (
                <>
                  <Tabs
                    tabs={["Video", "PDF"]}
                    active={materialTab}
                    onTabChange={setMaterialTab}
                    counts={{ Video: videoCount, PDF: pdfCount }}
                  />

                  {materialTab === "Video" ? (
                    notes.every(
                      (note) =>
                        !Array.isArray(note.videos) || note.videos.length === 0
                    ) ? (
                      <div className="rounded-2xl border border-dashed border-border/60 py-12 text-center text-sm text-muted-foreground">
                        No uploaded video recordings.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {notes.map((note, i) =>
                          Array.isArray(note.videos) &&
                          note.videos.length > 0 ? (
                            <div
                              key={note._id || i}
                              className="group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all hover:shadow-md"
                            >
                              <div className="flex items-start justify-between gap-3 border-b border-border/60 bg-muted/30 px-5 py-3">
                                <div>
                                  <h4 className="font-semibold text-foreground">
                                    {note.title || "Class Note"}
                                  </h4>
                                  <p className="mt-0.5 text-xs text-muted-foreground">
                                    {note.createdAt
                                      ? new Date(
                                          note.createdAt
                                        ).toLocaleString()
                                      : ""}
                                  </p>
                                </div>
                                <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-primary/20">
                                  Content Type : {note.contentType === "videoLecture"
                                    ? "Video Lecture"
                                    : "Class Note"}
                                </span>
                              </div>

                              <div className="space-y-3 px-5 py-4">
                                {note.lectureLink ? (
                                  <a
                                    href={note.lectureLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/15"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    Open Lecture Link
                                  </a>
                                ) : null}

                                <div>
                                 
                                  <div className="grid gap-2">
                                    {note.videos.map((video, index) => {
                                      const videoUrl =
                                        typeof video === "string"
                                          ? video
                                          : video?.url;
                                      const videoName =
                                        typeof video === "string"
                                          ? String(video).split("/").pop() ||
                                            `Video ${index + 1}`
                                          : video?.name ||
                                            String(video?.url || "")
                                              .split("/")
                                              .pop() ||
                                            `Video ${index + 1}`;
                                      if (!videoUrl) return null;
                                      return (
                                        <a
                                          key={index}
                                          href={videoUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="group/item flex items-center gap-3 rounded-xl border border-border/60 bg-gradient-to-r from-muted/30 to-transparent px-3 py-2.5 text-sm transition-all hover:border-primary/30 hover:from-primary/5"
                                        >
                                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover/item:bg-primary group-hover/item:text-primary-foreground">
                                            <PlayCircle className="h-4 w-4" />
                                          </div>
                                          <span className="flex-1 truncate font-medium">
                                            {videoName}
                                          </span>
                                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover/item:translate-x-0.5 group-hover/item:text-primary" />
                                        </a>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : null
                        )}
                      </div>
                    )
                  ) : notes.every(
                      (note) =>
                        !Array.isArray(note.pdfs) || note.pdfs.length === 0
                    ) ? (
                    <div className="rounded-2xl border border-dashed border-border/60 py-12 text-center text-sm text-muted-foreground">
                      No PDF attached to any material.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notes.map((note, i) =>
                        Array.isArray(note.pdfs) && note.pdfs.length > 0 ? (
                          <div
                            key={note._id || i}
                            className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all hover:shadow-md"
                          >
                            <div className="flex items-start justify-between gap-3 border-b border-border/60 bg-muted/30 px-5 py-3">
                              <div>
                                <h4 className="font-semibold text-foreground">
                                  {note.title || "Class Note"}
                                </h4>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  {note.createdAt
                                    ? new Date(note.createdAt).toLocaleString()
                                    : ""}
                                </p>
                              </div>
                              <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-primary/20">
                               Content Type : {note.contentType === "videoLecture"
                                  ? "Video Lecture"
                                  : "Class Note"}
                              </span>
                            </div>

                            <div className="space-y-3 px-5 py-4">
                              {note.content ? (
                                <p className="whitespace-pre-line rounded-xl bg-muted/40 p-3 text-sm leading-relaxed text-foreground/80">
                                  {note.content}
                                </p>
                              ) : null}

                              <div>
                               
                                <div className="grid gap-2 sm:grid-cols-2">
                                  {note.pdfs.map((pdf, index) => {
                                    const pdfUrl =
                                      typeof pdf === "string" ? pdf : pdf?.url;
                                    const pdfName =
                                      typeof pdf === "string"
                                        ? String(pdf).split("/").pop() ||
                                          `PDF ${index + 1}`
                                        : pdf?.name ||
                                          String(pdf?.url || "")
                                            .split("/")
                                            .pop() ||
                                          `PDF ${index + 1}`;
                                    if (!pdfUrl) return null;
                                    return (
                                      <button
                                        key={index}
                                        onClick={() =>
                                          openPdfPreview({
                                            url: pdfUrl,
                                            name: pdfName,
                                          })
                                        }
                                        className="group/pdf flex items-center gap-3 rounded-xl border border-border/60 bg-gradient-to-r from-muted/30 to-transparent px-3 py-2.5 text-left text-sm transition-all hover:border-blue-300 hover:from-blue-50/60 dark:hover:border-blue-800 dark:hover:from-blue-950/30"
                                      >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-200/60 transition-colors group-hover/pdf:bg-blue-600 group-hover/pdf:text-white dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/60">
                                          <FileText className="h-4 w-4" />
                                        </div>
                                        <span className="flex-1 truncate font-medium text-foreground">
                                          {pdfName}
                                        </span>
                                        <Eye className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover/pdf:text-blue-600" />
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : null
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* PDF Preview Dialog */}
        <Dialog
          open={pdfPreview.open}
          onOpenChange={(open) =>
            setPdfPreview((prev) => ({ ...prev, open }))
          }
        >
          <DialogContent className="max-h-[92vh] max-w-5xl overflow-hidden rounded-2xl p-0">
            <DialogHeader className="border-b border-border/60 bg-gradient-to-br from-blue-500/10 via-muted/40 to-background px-6 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-background/80 p-2 shadow-sm ring-1 ring-border/60">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <DialogTitle className="text-base font-semibold">
                      {pdfPreview.name || "PDF Preview"}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      Previewing file inside the dashboard
                    </DialogDescription>
                  </div>
                </div>
                {pdfPreview.url ? (
                  <a
                    href={pdfPreview.url}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="mr-8 inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </a>
                ) : null}
              </div>
            </DialogHeader>

            <div className="h-[80vh] w-full bg-muted/20">
              {pdfPreview.url ? (
                <iframe
                  src={pdfPreview.url}
                  title={pdfPreview.name || "PDF Preview"}
                  className="h-full w-full"
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
    </div>
  );
}
