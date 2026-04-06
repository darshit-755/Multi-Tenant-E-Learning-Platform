import { useState } from "react";
import { useAllTutors } from "@/hooks/admin/useAllTutors";
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

export default function Tutors() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    tenant: "",
    subject: "",
    status: ""
  });

  const {
    tutors,
    totalPages,
    isLoading,
    isError,
  } = useAllTutors(currentPage);

  if (isLoading) return <Loader />;

  if (isError) {
    return (
      <div className="p-4 sm:p-6">
        <p className="text-red-500">Failed to load tutors</p>
      </div>
    );
  }

  const filteredTutors = tutors.filter(tutor => {
    const nameMatch = !filters.name ||
      tutor.userId?.name?.toLowerCase().includes(filters.name.toLowerCase());
    const emailMatch = !filters.email ||
      tutor.userId?.email?.toLowerCase().includes(filters.email.toLowerCase());
    const tenantMatch = !filters.tenant ||
      tutor.tenantId?.name?.toLowerCase().includes(filters.tenant.toLowerCase());
    const subjectMatch = !filters.subject ||
      tutor.subjects?.some(sub => sub.toLowerCase().includes(filters.subject.toLowerCase()));
    const statusMatch = !filters.status || tutor.status === filters.status;

    return nameMatch && emailMatch && tenantMatch && subjectMatch && statusMatch;
  });

  return (
    <div className="p-2 sm:p-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Tutors
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
              placeholder="Filter by tenant"
              value={filters.tenant}
              onChange={(e) => setFilters(prev => ({ ...prev, tenant: e.target.value }))}
            />
            <Input
              placeholder="Filter by subject"
              value={filters.subject}
              onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
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
          </div>

          <div className="mb-4">
            <Button
              variant="outline"
              onClick={() =>
                setFilters({
                  name: "",
                  email: "",
                  tenant: "",
                  subject: "",
                  status: "",
                })
              }
            >
              Reset Filters
            </Button>
          </div>
          {filteredTutors.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              {tutors.length === 0 ? "No Tutors" : "No tutors match the filters"}
            </div>
          ) : (
            <>
              <div className="w-full overflow-x-auto">
                <Table className="min-w-200">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Subjects</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredTutors.map((tutor) => (
                      <TableRow key={tutor._id}>
                        <TableCell className="font-medium capitalize">
                          {tutor.userId?.name || "N/A"}
                        </TableCell>

                        <TableCell>
                          {tutor.userId?.email || "N/A"}
                        </TableCell>

                        <TableCell>
                          {tutor.phone || "N/A"}
                        </TableCell>

                        <TableCell>
                          {tutor.subjects?.join(", ") || "N/A"}
                        </TableCell>

                        <TableCell>
                          {tutor.experienceYears} years
                        </TableCell>

                        <TableCell className="capitalize">
                          {tutor.tenantId?.name || "N/A"}
                        </TableCell>

                        <TableCell>
                          <span
                            className={`px-3 py-1 text-xs rounded-full font-medium ${
                              tutor.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {tutor.status}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}