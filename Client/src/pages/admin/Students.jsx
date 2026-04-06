import { useState } from "react";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    batch: "",
    status: "",
    tenant: ""
  });

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
            <Input
              placeholder="Filter by name"
              value={filters.name}
              onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
            />
            <Input
              placeholder="Filter by email"
              value={filters.email}
              onChange={(e) => setFilters(prev => ({ ...prev, email: e.target.value }))}
            />
            <Input
              placeholder="Filter by batch"
              value={filters.batch}
              onChange={(e) => setFilters(prev => ({ ...prev, batch: e.target.value }))}
            />
            <Select
              value={filters.status || "all"}
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === "all" ? "" : value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Filter by tenant"
              value={filters.tenant}
              onChange={(e) => setFilters(prev => ({ ...prev, tenant: e.target.value }))}
            />
          </div>

          <div className="mb-4">
            <Button
              variant="outline"
              onClick={() =>
                setFilters({
                  name: "",
                  email: "",
                  batch: "",
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
              const batchMatch = !filters.batch || 
                student.batches?.some(batch => 
                  batch.name.toLowerCase().includes(filters.batch.toLowerCase()) ||
                  batch.subject.toLowerCase().includes(filters.batch.toLowerCase())
                );

              return nameMatch && emailMatch && statusMatch && tenantMatch && batchMatch;
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
                      <TableHead>Roll Number</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Board</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Parent</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student._id}>
                        <TableCell className="font-medium capitalize">
                          {student.userId?.name || "N/A"}
                        </TableCell>

                        <TableCell>
                          {student.userId?.email || "N/A"}
                        </TableCell>

                        <TableCell>
                          {student.rollNumber || "N/A"}
                        </TableCell>

                        <TableCell>
                          {student.classLevel || "N/A"}
                        </TableCell>

                        <TableCell>
                          {student.board || "N/A"}
                        </TableCell>

                        <TableCell>
                          {student.phone || "N/A"}
                        </TableCell>

                        <TableCell>
                          {student.parentName || "N/A"}
                        </TableCell>

                        <TableCell className="capitalize">
                          {student.tenantId?.name || "N/A"}
                        </TableCell>

                        <TableCell>
                          {student.batches && student.batches.length > 0
                            ? student.batches.map((batch, index) => (
                                <div key={batch._id} className="text-sm">
                                  {batch.name} ({batch.subject})
                                  {index < student.batches.length - 1 && ", "}
                                </div>
                              ))
                            : "No batches"}
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