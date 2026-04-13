import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetMyBatches } from "@/hooks/tutor/useGetMyBatches";
import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetMyClasses } from "@/hooks/tutor/useGetMyClasses";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  BookOpen,
  CalendarDays,
  CalendarX2,
  Clock3,
  Video,
} from "lucide-react";

export default function Students() {
  const { data: batchesData, isLoading } = useGetMyBatches();
  const { data: classesData, isLoading: classesLoading } = useGetMyClasses();
  const batches = batchesData?.batches || [];
  const classes = classesData?.classes || [];

  const ALL_VALUE = "__all";

  const [filters, setFilters] = useState({
    studentName: "",
    batch: ALL_VALUE,
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("today");
  const [nowTs, setNowTs] = useState(() => Date.now());

  useEffect(() => {
    const timerId = setInterval(() => setNowTs(Date.now()), 30 * 1000);
    return () => clearInterval(timerId);
  }, []);

  const normalizeDate = (date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const getClassDate = (dateStr) => {
    if (!dateStr) return null;
    const parsed = new Date(`${dateStr}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : normalizeDate(parsed);
  };

  const formatClassTime = (cls) => {
    if (!cls.startTime) return "-";
    return `${cls.startTime} (${cls.duration || 0} min)`;
  };

  const formatClassDate = (dateStr) => {
    const classDate = getClassDate(dateStr);
    if (!classDate) return "Date unavailable";
    return classDate.toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const normalizeStatus = (status) => String(status || "").trim().toLowerCase();

  const parseClassStartDateTime = (cls) => {
    if (!cls?.date || !cls?.startTime) return null;

    const datePart = String(cls.date).split("T")[0];
    const baseDate = new Date(`${datePart}T00:00:00`);
    if (Number.isNaN(baseDate.getTime())) return null;

    const timeMatch = String(cls.startTime)
      .trim()
      .match(/^(\d{1,2}):(\d{2})(?:\s*([AaPp][Mm]))?$/);
    if (!timeMatch) return null;

    let hours = Number(timeMatch[1]);
    const minutes = Number(timeMatch[2]);
    const meridiem = timeMatch[3]?.toUpperCase();

    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;

    if (meridiem) {
      if (hours === 12) hours = 0;
      if (meridiem === "PM") hours += 12;
    }

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

    const startDateTime = new Date(baseDate);
    startDateTime.setHours(hours, minutes, 0, 0);
    return startDateTime;
  };

  const getJoinCutoffTime = (cls) => {
    const startDateTime = parseClassStartDateTime(cls);
    if (!startDateTime) return null;

    const duration = Number(cls.duration);
    const durationMinutes = Number.isFinite(duration) && duration > 0 ? duration : 0;
    const graceMinutes = 15;
    return new Date(startDateTime.getTime() + (durationMinutes + graceMinutes) * 60 * 1000);
  };

  const canShowJoinButton = (cls) => {
    if (!cls?.videoLink) return false;

    const status = normalizeStatus(cls.status);
    if (status === "cancelled" || status === "completed") return false;

    const cutoffTime = getJoinCutoffTime(cls);
    if (!cutoffTime) return true;

    return nowTs <= cutoffTime.getTime();
  };

  const getStatusLabel = (status) => {
    const normalizedStatus = normalizeStatus(status);
    if (normalizedStatus === "completed") return "Completed";
    if (normalizedStatus === "cancelled") return "Cancelled";
    return "Scheduled";
  };

  const getStatusTone = (status) => {
    const normalizedStatus = normalizeStatus(status);
    if (normalizedStatus === "completed") {
      return "text-emerald-700 bg-emerald-50 border-emerald-100";
    }
    if (normalizedStatus === "cancelled") {
      return "text-rose-700 bg-rose-50 border-rose-100";
    }
    return "text-sky-700 bg-sky-50 border-sky-100";
  };

  const today = normalizeDate(new Date());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const studentClassGroups = (() => {
    if (!selectedStudent?._id) {
      return { todayClasses: [], upcomingClasses: [], previousClasses: [] };
    }

    const studentClasses = classes.filter((cls) =>
      cls.batchId?.studentIds?.some((s) => s?._id === selectedStudent._id),
    );

    const todayClasses = [];
    const upcomingClasses = [];
    const previousClasses = [];

    studentClasses.forEach((cls) => {
      const classDate = getClassDate(cls.date);
      if (!classDate) return;

      if (classDate.getTime() === today.getTime()) todayClasses.push(cls);
      else if (classDate > today) upcomingClasses.push(cls);
      else if (classDate.getTime() === yesterday.getTime()) {
        previousClasses.push(cls);
      }
    });

    const sortByDate = (a, b) => {
      const dateA = getClassDate(a.date);
      const dateB = getClassDate(b.date);
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateA - dateB;
    };

    return {
      todayClasses: todayClasses.sort(sortByDate),
      upcomingClasses: upcomingClasses.sort(sortByDate),
      previousClasses: previousClasses.sort(sortByDate).reverse(),
    };
  })();

  const openStudentDetails = (student) => {
    setSelectedStudent(student);
    setActiveTab("today");
    setOpenDetailsDialog(true);
  };

  // Extract all students from batches
  const allStudents = [];
  batches.forEach((batch) => {
    if (batch.studentIds && batch.studentIds.length > 0) {
      batch.studentIds.forEach((student) => {
        allStudents.push({
          ...student,
          batchName: batch.name,
          batchId: batch._id,
          subjectName: batch.subjectId?.name || "-",
        });
      });
    }
  });

  const uniqueBatches = [
    ...new Set(batches.map((b) => b.name).filter(Boolean)),
  ];

  const filteredStudents = allStudents.filter((student) => {
    const matchesName =
      !filters.studentName ||
      (student.userId?.name || "")
        .toLowerCase()
        .includes(filters.studentName.toLowerCase());
    const matchesBatch =
      filters.batch === ALL_VALUE || student.batchName === filters.batch;
    return matchesName && matchesBatch;
  });

  const resetFilters = () => setFilters({ studentName: "", batch: ALL_VALUE });

  // Cleaner timeline list for the student detail panel
  const renderClassList = (data, emptyText) => {
    if (data.length === 0) {
      return (
        <div className="flex min-h-55 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-5 text-center">
          <span className="mb-3 rounded-full bg-slate-100 p-2.5 text-slate-500">
            <CalendarX2 className="h-4 w-4" />
          </span>
          <p className="text-sm font-medium text-slate-700">{emptyText}</p>
          <p className="mt-1 text-xs text-slate-500">
            New class activity will appear here.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {data.map((cls) => {
          const normalizedStatus = normalizeStatus(cls.status);
          const isCompleted = normalizedStatus === "completed";
          const canJoin = canShowJoinButton(cls);
          const tone = getStatusTone(cls.status);

          return (
            <div
              key={cls._id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">
                    {cls.topic || "Class Session"}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatClassDate(cls.date)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5" />
                      {formatClassTime(cls)}
                    </span>
                  </div>
                  <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-slate-500">
                    <BookOpen className="h-3.5 w-3.5" />
                    {cls.subjectId?.name || "Subject unavailable"}
                  </p>
                </div>

                <span
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tone}`}
                >
                  {getStatusLabel(cls.status)}
                </span>
              </div>

              <div className="mt-3 flex justify-end">
                {canJoin ? (
                  <Button
                    size="sm"
                    onClick={() => window.open(cls.videoLink, "_blank")}
                    className="h-8 rounded-lg bg-slate-900 px-3 text-xs font-medium transition-all duration-200 hover:-translate-y-px hover:bg-slate-700"
                  >
                    <Video className="mr-1.5 h-3.5 w-3.5" />
                    Join Class
                  </Button>
                ) : (
                  <span className="text-xs text-slate-400">
                    {isCompleted
                      ? "Class completed"
                      : "Meeting link not available"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading || classesLoading) return <Loader />;

  const tabs = [
    {
      key: "today",
      label: "Today",
      count: studentClassGroups.todayClasses.length,
    },
    {
      key: "upcoming",
      label: "Upcoming",
      count: studentClassGroups.upcomingClasses.length,
    },
    {
      key: "completed",
      label: "Completed",
      count: studentClassGroups.previousClasses.length,
    },
  ];
  const activeTabIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.key === activeTab),
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Students</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          {allStudents.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No students in your batches
            </div>
          ) : (
            <>
              {/* Filters */}
              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium">Filters</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetFilters}
                    className="text-sm"
                  >
                    Reset Filters
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="student-name-filter"
                      className="text-sm font-medium"
                    >
                      Student Name
                    </Label>
                    <Input
                      id="student-name-filter"
                      placeholder="Search by student name..."
                      value={filters.studentName}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          studentName: e.target.value,
                        }))
                      }
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="batch-filter"
                      className="text-sm font-medium"
                    >
                      Batch
                    </Label>
                    <Select
                      value={filters.batch}
                      onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, batch: value }))
                      }
                    >
                      <SelectTrigger id="batch-filter" className="w-full">
                        <SelectValue placeholder="All batches" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ALL_VALUE}>All batches</SelectItem>
                        {uniqueBatches.map((batch) => (
                          <SelectItem key={batch} value={batch}>
                            {batch}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Subject</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <TableRow
                          key={student._id}
                          className="cursor-pointer hover:bg-slate-50"
                          onClick={() => openStudentDetails(student)}
                        >
                          <TableCell className="font-medium capitalize">
                            {student.userId?.name || "-"}
                          </TableCell>
                          <TableCell>{student.userId?.email || "-"}</TableCell>
                          <TableCell>{student.batchName}</TableCell>
                          <TableCell>{student.subjectName}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-sm">
                          {allStudents.length === 0
                            ? "No students in your batches"
                            : "No students match the current filters"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Student detail panel */}
      <Dialog open={openDetailsDialog} onOpenChange={setOpenDetailsDialog}>
        <DialogContent className="flex! w-[95vw] sm:max-w-2xl! max-h-[90vh] flex-col! overflow-hidden rounded-2xl border border-slate-200 p-0 shadow-2xl [&>button]:right-4 [&>button]:top-4 [&>button]:rounded-full [&>button]:border [&>button]:border-slate-200 [&>button]:bg-white [&>button]:opacity-100">
          <div className="bg-slate-50 p-6 pb-5">
            <div className="flex items-start gap-4 pr-10">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-xl font-semibold text-white">
                {selectedStudent?.userId?.name?.charAt(0)?.toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0">
                <p className="text-lg font-semibold capitalize text-slate-900">
                  {selectedStudent?.userId?.name || "Student"}
                </p>
                <p className="text-sm text-slate-500">
                  {selectedStudent?.userId?.email || "-"}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                    {selectedStudent?.batchName || "Batch unavailable"}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                    {selectedStudent?.subjectName || "Subject unavailable"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {[
                [
                  "Today",
                  studentClassGroups.todayClasses.length,
                  "text-sky-700 bg-sky-50 border-sky-100",
                ],
                [
                  "Upcoming",
                  studentClassGroups.upcomingClasses.length,
                  "text-amber-700 bg-amber-50 border-amber-100",
                ],
                [
                  "Completed",
                  studentClassGroups.previousClasses.length,
                  "text-emerald-700 bg-emerald-50 border-emerald-100",
                ],
              ].map(([label, count, tone]) => (
                <div
                  key={label}
                  className={`rounded-xl border px-4 py-3 ${tone}`}
                >
                  <p className="text-2xl font-semibold leading-none">{count}</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-y border-slate-200 bg-white px-5 py-3">
            <div className="relative grid grid-cols-3 rounded-lg bg-slate-100 p-1">
              <span
                className="pointer-events-none absolute top-1 bottom-1 left-1 rounded-md bg-white shadow-sm transition-transform duration-300 ease-out"
                style={{
                  width: `calc((100% - 0.5rem) / ${tabs.length})`,
                  transform: `translateX(${activeTabIndex * 100}%)`,
                }}
              />
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative z-10 rounded-md px-3 py-1.5 text-sm transition-colors ${
                    activeTab === tab.key
                      ? "font-semibold text-slate-900"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-5 py-4">
            {activeTab === "today" &&
              renderClassList(
                studentClassGroups.todayClasses,
                "No classes scheduled for today",
              )}
            {activeTab === "upcoming" &&
              renderClassList(
                studentClassGroups.upcomingClasses,
                "No upcoming classes",
              )}
            {activeTab === "completed" &&
              renderClassList(
                studentClassGroups.previousClasses,
                "No completed classes for yesterday",
              )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
