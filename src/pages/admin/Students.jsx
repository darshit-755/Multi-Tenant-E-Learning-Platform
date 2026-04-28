import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAllStudents } from "@/hooks/admin/useAllStudents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
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
                    placeholder="Filter by center"
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
                        <TableHead>Center</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow
                          key={student._id}
                        onClick={() => navigate(`/admin/student/${student._id}`)}
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
      </div>
    );
}