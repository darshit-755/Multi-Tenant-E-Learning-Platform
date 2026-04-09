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
import { useGetMyBatches } from "@/hooks/student/useGetMyBatches";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function StudentBatches() {
  const { data: batchesData, isLoading } = useGetMyBatches();
  const batches = batchesData?.batches || [];

  const ALL_VALUE = "__all";

  const [filters, setFilters] = useState({
    batchName: "",
    subject: ALL_VALUE,
    status: ALL_VALUE,
  });

  // Get unique values for dropdowns
  const uniqueSubjects = [
    ...new Set(batches.map((batch) => batch.subjectId?.name).filter(Boolean)),
  ];
  const statusOptions = ["Active", "Completed"];

  // Filter batches based on current filters
  const filteredBatches = batches.filter((batch) => {
    const matchesBatchName =
      !filters.batchName ||
      (batch.name || "").toLowerCase().includes(filters.batchName.toLowerCase());
    const matchesSubject =
      filters.subject === ALL_VALUE || batch.subjectId?.name === filters.subject;
    const matchesStatus =
      filters.status === ALL_VALUE ||
      (filters.status === "Active" && batch.status !== "completed") ||
      (filters.status === "Completed" && batch.status === "completed");

    return matchesBatchName && matchesSubject && matchesStatus;
  });

  // Reset filters
  const resetFilters = () => {
    setFilters({
      batchName: "",
      subject: ALL_VALUE,
      status: ALL_VALUE,
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">My Batches</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading batches...</p>
          ) : batches.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No batches assigned
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Batch Name Filter */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="batch-name-filter"
                      className="text-sm font-medium"
                    >
                      Batch Name
                    </Label>
                    <Input
                      id="batch-name-filter"
                      placeholder="Search by batch name..."
                      value={filters.batchName}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          batchName: e.target.value,
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
                      <TableHead>Batch Name</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Tutor</TableHead>
                      <TableHead>Total Students</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredBatches.length > 0 ? (
                      filteredBatches.map((batch) => (
                        <TableRow key={batch._id}>
                          <TableCell className="font-medium capitalize">
                            {batch.name}
                          </TableCell>

                          <TableCell>{batch.subjectId?.name || "-"}</TableCell>

                          <TableCell>{batch.teacherId?.userId?.name || "-"}</TableCell>

                          <TableCell className="text-left">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  {batch.studentIds?.length || 0} Students
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="start"
                                className="w-56"
                              >
                                {batch.studentIds?.length > 0 ? (
                                  batch.studentIds.map((student) => (
                                    <DropdownMenuItem
                                      key={student._id}
                                      className="text-sm cursor-default"
                                    >
                                      {student.userId?.name || "Unknown"}
                                    </DropdownMenuItem>
                                  ))
                                ) : (
                                  <DropdownMenuItem
                                    disabled
                                    className="text-sm"
                                  >
                                    No students
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>

                          <TableCell>
                            <span
                              className={`px-3 py-1 text-xs rounded-full font-medium ${
                                batch.status === "completed"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {batch.status === "completed"
                                ? "Completed"
                                : "Active"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                          {batches.length === 0
                            ? "No batches assigned"
                            : "No batches match the current filters"}
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
    </div>
  );
}
