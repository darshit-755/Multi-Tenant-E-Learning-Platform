import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useAllStudents } from "@/hooks/admin/useAllStudents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Loader from "@/components/common/Loader";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function Students() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const { control, watch, reset } = useForm({
    defaultValues: {
      name: "",
      email: "",
      status: "",
      tenant: ""
    }
  });

  const filters = watch();

  const {
    students,
    totalPages,
    isLoading,
    isError,
  } = useAllStudents(currentPage);

  if (isLoading) return <Loader />;

  if (isError) {
    return (
      <div className="p-4 sm:p-6">
        <p className="text-red-500">Failed to load students</p>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Students
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  placeholder="Filter by name"
                  {...field}
                />
              )}
            />
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  placeholder="Filter by email"
                  {...field}
                />
              )}
            />
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value || "all"} onValueChange={(value) => field.onChange(value === "all" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <Controller
              name="tenant"
              control={control}
              render={({ field }) => (
                <Input
                  placeholder="Filter by tenant"
                  {...field}
                />
              )}
            />
          </div>

          <div className="mb-4">
            <Button
              variant="outline"
              onClick={() =>
                reset({
                  name: "",
                  email: "",
                  status: "",
                  tenant: "",
                })
              }
            >
              Reset Filters
            </Button>
          </div>

          {(() => {
            // Filter students based on filters
            const filteredStudents = students.filter(student => {
              const nameMatch = !filters.name || 
                student.userId?.name?.toLowerCase().includes(filters.name.toLowerCase());
              const emailMatch = !filters.email || 
                student.userId?.email?.toLowerCase().includes(filters.email.toLowerCase());
              const statusMatch = !filters.status || filters.status === "all" || student.status === filters.status;
              const tenantMatch = !filters.tenant || 
                student.tenantId?.name?.toLowerCase().includes(filters.tenant.toLowerCase());

              return nameMatch && emailMatch && statusMatch && tenantMatch;
            });

            return filteredStudents.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              {students.length === 0 ? "No Students" : "No students match the filters"}
            </div>
          ) : (
            <>
              <div className="w-full overflow-x-auto">
                <Table className="min-w-200">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow
                        key={student._id}
                        onClick={() => setSelectedStudent(student)}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell className="font-medium capitalize">
                          {student.userId?.name || "N/A"}
                        </TableCell>

                        <TableCell>
                          {student.userId?.email || "N/A"}
                        </TableCell>

                        <TableCell className="capitalize">
                          {student.tenantId?.name || "N/A"}
                        </TableCell>

                        <TableCell>
                          <span
                            className={`px-3 py-1 text-xs rounded-full font-medium ${
                              student.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {student.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <Pagination className="mt-6">
                  <PaginationContent>
                    {/* Previous */}
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          currentPage > 1 &&
                          setCurrentPage((prev) => prev - 1)
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {/* Page Numbers */}
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;

                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            isActive={currentPage === pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className="cursor-pointer"
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    {/* Next */}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          currentPage < totalPages &&
                          setCurrentPage((prev) => prev + 1)
                        }
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )})()}
        </CardContent>
      </Card>

      {/* Student Details Modal */}
      <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedStudent?.userId?.name || "Student"}
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="font-semibold text-lg mb-3 border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium capitalize">{selectedStudent.userId?.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedStudent.userId?.email || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{selectedStudent.status || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tenant</p>
                    <p className="font-medium capitalize">{selectedStudent.tenantId?.name || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h3 className="font-semibold text-lg mb-3 border-b pb-2">Academic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Roll Number</p>
                    <p className="font-medium">{selectedStudent.rollNumber || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Class</p>
                    <p className="font-medium">{selectedStudent.classLevel || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Board</p>
                    <p className="font-medium">{selectedStudent.board || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="font-semibold text-lg mb-3 border-b pb-2">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedStudent.phone || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Parent Name</p>
                    <p className="font-medium">{selectedStudent.parentName || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Batches */}
              <div>
                <h3 className="font-semibold text-lg mb-3 border-b pb-2">Enrolled Batches</h3>
                {selectedStudent.batches && selectedStudent.batches.length > 0 ? (
                  <div className="space-y-2">
                    {selectedStudent.batches.map((batch) => (
                      <div key={batch._id} className="bg-muted p-3 rounded-md">
                        <p className="font-medium">{batch.name}</p>
                        <p className="text-sm text-muted-foreground">Subject: {batch.subject}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No batches enrolled</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}