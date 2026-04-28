import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useAllBatches } from "@/hooks/admin/useAllBatches";
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

export default function Batches() {
  const [currentPage, setCurrentPage] = useState(1);
  const { control, watch, reset } = useForm({
    defaultValues: {
      batchName: "",
      tenant: "",
      subject: "",
      status: ""
    }
  });

  const filters = watch();

  const {
    batches,
    totalPages,
    isLoading,
    isError,
  } = useAllBatches(currentPage);

  if (isLoading) return <Loader />;

  if (isError) {
    return (
      <div className="p-4 sm:p-6">
        <p className="text-red-500">Failed to load batches</p>
      </div>
    );
  }

  const filteredBatches = batches.filter(batch => {
    const batchNameMatch = !filters.batchName ||
      batch.name?.toLowerCase().includes(filters.batchName.toLowerCase());
    const tenantMatch = !filters.tenant ||
      batch.tenantId?.name?.toLowerCase().includes(filters.tenant.toLowerCase());
    const subjectMatch = !filters.subject ||
      batch.subjectId?.name?.toLowerCase().includes(filters.subject.toLowerCase());
    const statusMatch = !filters.status || batch.status === filters.status;

    return batchNameMatch && tenantMatch && subjectMatch && statusMatch;
  });

  return (
    <div className="p-2 sm:p-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Batches
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Controller
              name="batchName"
              control={control}
              render={({ field }) => (
                <Input
                  placeholder="Filter by batch name"
                  {...field}
                />
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
            <Controller
              name="subject"
              control={control}
              render={({ field }) => (
                <Input
                  placeholder="Filter by subject"
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
          </div>

          <div className="mb-4">
            <Button
              variant="outline"
              onClick={() =>
                reset({
                  batchName: "",
                  tenant: "",
                  subject: "",
                  status: "",
                })
              }
            >
              Reset Filters
            </Button>
          </div>
          {filteredBatches.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              {batches.length === 0 ? "No Batches" : "No batches match the filters"}
            </div>
          ) : (
            <>
              <div className="w-full overflow-x-auto">
                <Table className="min-w-200">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch Name</TableHead>
                      <TableHead>Center</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Students Count</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredBatches.map((batch) => (
                      <TableRow key={batch._id}>
                        <TableCell className="font-medium capitalize">
                          {batch.name}
                        </TableCell>

                        <TableCell className="capitalize">
                          {batch.tenantId?.name || "N/A"}
                        </TableCell>

                        <TableCell>
                          {batch.subjectId?.name || "N/A"}
                        </TableCell>

                        <TableCell>
                          {batch.teacherId?.userId?.name || "N/A"}
                        </TableCell>

                        <TableCell>
                          {batch.studentIds?.length || 0}
                        </TableCell>

                        <TableCell>
                          <span
                            className={`px-3 py-1 text-xs rounded-full font-medium ${
                              batch.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {batch.status}
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