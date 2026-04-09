import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetMyClasses } from "@/hooks/student/useGetMyClasses";
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

export default function StudentClasses() {
  const { data: classesData, isLoading } = useGetMyClasses();
  const classes = classesData?.classes || [];

  const ALL_VALUE = "__all";

  const [filters, setFilters] = useState({
    topic: "",
    subject: ALL_VALUE,
    batch: ALL_VALUE,
    schedule: ALL_VALUE,
    status: ALL_VALUE,
  });

  // Get unique values for dropdowns
  const uniqueSubjects = [
    ...new Set(classes.map((cls) => cls.subjectId?.name).filter(Boolean)),
  ];
  const uniqueBatches = [
    ...new Set(classes.map((cls) => cls.batchId?.name).filter(Boolean)),
  ];
  const statusOptions = ["Scheduled", "Completed", "Cancelled"];

  // Date range helpers for schedule filter
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDateRange = (type) => {
    const start = new Date(today);
    const end = new Date(today);

    if (type === "today") {
      return { start, end };
    } else if (type === "last5") {
      start.setDate(start.getDate() - 5);
      end.setDate(end.getDate() - 1);
      return { start, end };
    } else if (type === "next5") {
      start.setDate(start.getDate() + 1);
      end.setDate(end.getDate() + 5);
      return { start, end };
    }
  };

  const scheduleOptions = [
    { label: "Last 5 days", value: "last5" },
    { label: "Today", value: "today" },
    { label: "Next 5 days", value: "next5" },
  ];

  // Filter classes based on current filters
  const filteredClasses = classes.filter((cls) => {
    const matchesTopic =
      !filters.topic ||
      (cls.topic || "").toLowerCase().includes(filters.topic.toLowerCase());
    const matchesSubject =
      filters.subject === ALL_VALUE || cls.subjectId?.name === filters.subject;
    const matchesBatch =
      filters.batch === ALL_VALUE || cls.batchId?.name === filters.batch;
    const matchesStatus =
      filters.status === ALL_VALUE ||
      (filters.status === "Scheduled" &&
        cls.status !== "completed" &&
        cls.status !== "cancelled") ||
      (filters.status === "Completed" && cls.status === "completed") ||
      (filters.status === "Cancelled" && cls.status === "cancelled");

    let matchesSchedule = filters.schedule === ALL_VALUE;
    if (!matchesSchedule && cls.date) {
      const classDate = new Date(cls.date);
      classDate.setHours(0, 0, 0, 0);
      const range = getDateRange(filters.schedule);
      matchesSchedule = classDate >= range.start && classDate <= range.end;
    }

    return (
      matchesTopic &&
      matchesSubject &&
      matchesBatch &&
      matchesSchedule &&
      matchesStatus
    );
  });

  // Reset filters
  const resetFilters = () => {
    setFilters({
      topic: "",
      subject: ALL_VALUE,
      batch: ALL_VALUE,
      schedule: ALL_VALUE,
      status: ALL_VALUE,
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">My Classes</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading classes...</p>
          ) : (
            <div>
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Topic Filter */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="topic-filter"
                      className="text-sm font-medium"
                    >
                      Topic
                    </Label>
                    <Input
                      id="topic-filter"
                      placeholder="Search by topic..."
                      value={filters.topic}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          topic: e.target.value,
                        }))
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Subject Filter */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="subject-filter"
                      className="text-sm font-medium"
                    >
                      Subject
                    </Label>
                    <Select
                      value={filters.subject}
                      onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, subject: value }))
                      }
                    >
                      <SelectTrigger id="subject-filter" className="w-full">
                        <SelectValue placeholder="All subjects" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ALL_VALUE}>All subjects</SelectItem>
                        {uniqueSubjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Batch Filter */}
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

                  {/* Schedule Filter */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="schedule-filter"
                      className="text-sm font-medium"
                    >
                      Schedule
                    </Label>
                    <Select
                      value={filters.schedule}
                      onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, schedule: value }))
                      }
                    >
                      <SelectTrigger id="schedule-filter" className="w-full">
                        <SelectValue placeholder="All dates" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ALL_VALUE}>All dates</SelectItem>
                        {scheduleOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="status-filter"
                      className="text-sm font-medium"
                    >
                      Status
                    </Label>
                    <Select
                      value={filters.status}
                      onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger id="status-filter" className="w-full">
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ALL_VALUE}>All statuses</SelectItem>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Topic</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Tutor</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Meeting</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredClasses.length > 0 ? (
                      filteredClasses.map((cls) => (
                        <TableRow key={cls._id}>
                          <TableCell className="font-medium">
                            {cls.topic || "Class Session"}
                          </TableCell>
                          <TableCell>{cls.subjectId?.name || "-"}</TableCell>
                          <TableCell>{cls.batchId?.name || "-"}</TableCell>
                          <TableCell>{cls.teacherId?.userId?.name || "-"}</TableCell>
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
                            {cls.videoLink && cls.status !== "completed" ? (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() =>
                                  window.open(cls.videoLink, "_blank")
                                }
                              >
                                Join
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                {cls.status === "completed"
                                  ? "Class completed"
                                  : "-"}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-3 py-1 text-xs rounded-full font-medium ${
                                cls.status === "completed"
                                  ? "bg-blue-100 text-blue-800"
                                  : cls.status === "cancelled"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-green-100 text-green-800"
                              }`}
                            >
                              {cls.status === "completed"
                                ? "Completed"
                                : cls.status === "cancelled"
                                  ? "Cancelled"
                                  : "Scheduled"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                          {classes.length === 0
                            ? "No classes found"
                            : "No classes match your filters"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
