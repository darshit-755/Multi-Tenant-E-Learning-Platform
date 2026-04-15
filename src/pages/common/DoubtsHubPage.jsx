import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getTutorClassesApi } from "@/services/class.api";
import { getStudentClassesApi } from "@/services/student.api";

export default function DoubtsHubPage({ role = "student" }) {
  const navigate = useNavigate();
  const ALL_VALUE = "__all";
  const [filters, setFilters] = useState({
    topic: "",
    subject: ALL_VALUE,
    batch: ALL_VALUE,
    schedule: ALL_VALUE,
    status: ALL_VALUE,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["doubt-classes", role],
    queryFn: async () => {
      const response =
        role === "tutor" ? await getTutorClassesApi() : await getStudentClassesApi();
      return response.data;
    },
  });

  const classes = useMemo(() => data?.classes || [], [data]);
  const basePath = role === "tutor" ? "/tutor" : "/student";
  const normalizeStatus = (status) => String(status || "").trim().toLowerCase();

  const uniqueSubjects = [
    ...new Set(classes.map((cls) => cls.subjectId?.name).filter(Boolean)),
  ];
  const uniqueBatches = [
    ...new Set(classes.map((cls) => cls.batchId?.name).filter(Boolean)),
  ];
  const statusOptions = ["Scheduled", "Completed", "Cancelled"];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDateRange = (type) => {
    const start = new Date(today);
    const end = new Date(today);

    if (type === "today") {
      return { start, end };
    }
    if (type === "last5") {
      start.setDate(start.getDate() - 5);
      end.setDate(end.getDate() - 1);
      return { start, end };
    }

    start.setDate(start.getDate() + 1);
    end.setDate(end.getDate() + 5);
    return { start, end };
  };

  const scheduleOptions = [
    { label: "Last 5 days", value: "last5" },
    { label: "Today", value: "today" },
    { label: "Next 5 days", value: "next5" },
  ];

  const filteredClasses = classes.filter((cls) => {
    const normalizedStatus = normalizeStatus(cls.status);
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
        normalizedStatus !== "completed" &&
        normalizedStatus !== "cancelled") ||
      (filters.status === "Completed" && normalizedStatus === "completed") ||
      (filters.status === "Cancelled" && normalizedStatus === "cancelled");

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

  const sortedClasses = useMemo(() => {
    if (role !== "tutor") return filteredClasses;

    return [...filteredClasses].sort((a, b) => {
      const aCount = Number(a?.doubtCount) || 0;
      const bCount = Number(b?.doubtCount) || 0;
      if (bCount !== aCount) return bCount - aCount;
      return 0;
    });
  }, [filteredClasses, role]);

  const resetFilters = () => {
    setFilters({
      topic: "",
      subject: ALL_VALUE,
      batch: ALL_VALUE,
      schedule: ALL_VALUE,
      status: ALL_VALUE,
    });
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading classes...</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-red-600">
        Failed to load classes for doubts page.
      </p>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="w-full max-w-5xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              No classes found. Once classes are assigned, doubts will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="w-full max-w-6xl mx-auto">
        <CardContent className="p-4 space-y-4">
          <div className="space-y-4">
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
              <div className="space-y-2">
                <Label htmlFor="topic-filter" className="text-sm font-medium">
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

              <div className="space-y-2">
                <Label htmlFor="subject-filter" className="text-sm font-medium">
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

              <div className="space-y-2">
                <Label htmlFor="batch-filter" className="text-sm font-medium">
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

              <div className="space-y-2">
                <Label htmlFor="schedule-filter" className="text-sm font-medium">
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

              <div className="space-y-2">
                <Label htmlFor="status-filter" className="text-sm font-medium">
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
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                  {role === "tutor" && <TableHead>Doubts</TableHead>}
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedClasses.length > 0 ? sortedClasses.map((cls) => {
                  const normalizedStatus = normalizeStatus(cls.status);
                  const isCompleted = normalizedStatus === "completed";
                  const isCancelled = normalizedStatus === "cancelled";
                  const doubtCount = Number(cls?.doubtCount) || 0;

                  return (
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
                        <span
                          className={`px-3 py-1 text-xs rounded-full font-medium ${
                            isCompleted
                              ? "bg-blue-100 text-blue-800"
                              : isCancelled
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {isCompleted ? "Completed" : isCancelled ? "Cancelled" : "Scheduled"}
                        </span>
                      </TableCell>
                      {role === "tutor" && (
                        <TableCell>
                          {doubtCount > 0 ? (
                            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                              {doubtCount} New Doubt{doubtCount > 1 ? "s" : ""}
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                              No Doubts
                            </span>
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`${basePath}/class-doubts/${cls._id}`)}
                        >
                          {role === "student" ? "Raise Doubt" : "View Doubts"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                }) : (
                  <TableRow>
                    <TableCell colSpan={role === "tutor" ? 7 : 6} className="text-center text-sm">
                      No classes match the current filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
