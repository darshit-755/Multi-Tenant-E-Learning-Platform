import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { usePendingTenants } from "@/hooks/admin/usePendingTenants";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import ConfirmActionDialog from "@/components/common/ConfirmActionDialog";

export default function Tenants() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingAction, setPendingAction] = useState(null);
  const [selectedTenantId, setSelectedTenantId] = useState(null);
  const { control, watch, reset } = useForm({
    defaultValues: {
      tuitionName: "",
      email: "",
      plan: "",
      status: "",
    }
  });

  const filters = watch();

  const {
    tenants,
    totalPages,
    isLoading,
    isError,
    handleApprove,
    handleBlock,
    handleDelete,
    handleInactive,
    isActionLoading,
  } = usePendingTenants(currentPage);

  const openConfirmDialog = (tenantId, action) => {
    setSelectedTenantId(tenantId);
    setPendingAction(action);
  };

  const closeConfirmDialog = () => {
    setSelectedTenantId(null);
    setPendingAction(null);
  };

  const confirmAction = () => {
    if (!selectedTenantId || !pendingAction) return;

    if (pendingAction === "approve") {
      handleApprove(selectedTenantId);
    }
    if (pendingAction === "inactive") {
      handleInactive(selectedTenantId);
    }
    if (pendingAction === "suspend") {
      handleBlock(selectedTenantId);
    }
    if (pendingAction === "delete") {
      handleDelete(selectedTenantId);
    }

    closeConfirmDialog();
  };

  const confirmCopy = {
    approve: {
      title: "Approve center?",
      description: "This will activate the center account and allow dashboard access.",
      confirmText: "Approve",
    },
    inactive: {
      title: "Mark center as inactive?",
      description: "The center account will be disabled until reactivated.",
      confirmText: "Mark Inactive",
    },
    suspend: {
      title: "Suspend center?",
      description: "This will suspend the center account and restrict access immediately.",
      confirmText: "Suspend",
    },
    delete: {
      title: "Delete center?",
      description: "This will permanently remove the center account.",
      confirmText: "Delete",
    },
  };

  const activeConfirm = pendingAction ? confirmCopy[pendingAction] : null;

  const filteredTenants = tenants.filter((tenant) => {
    const tuitionNameMatch =
      !filters.tuitionName ||
      tenant.name?.toLowerCase().includes(filters.tuitionName.toLowerCase());

    const emailMatch =
      !filters.email ||
      tenant.ownerUserId?.email
        ?.toLowerCase()
        .includes(filters.email.toLowerCase());

    const planMatch =
      !filters.plan ||
      tenant.plan?.toLowerCase().includes(filters.plan.toLowerCase());

    const statusMatch = !filters.status || tenant.status === filters.status;

    return tuitionNameMatch && emailMatch && planMatch && statusMatch;
  });


  if (isLoading) return <Loader />;

  if (isError) {
    return (
      <div className="p-4 sm:p-6">
        <p className="text-red-500">Failed to load centers</p>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Centers
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Controller
              name="tuitionName"
              control={control}
              render={({ field }) => (
                <Input
                  placeholder="Filter by tuition name"
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
              name="plan"
              control={control}
              render={({ field }) => (
                <Input
                  placeholder="Filter by plan"
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
                    <SelectItem value="blocked">Suspended</SelectItem>
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
                  tuitionName: "",
                  email: "",
                  plan: "",
                  status: "",
                })
              }
            >
              Reset Filters
            </Button>
          </div>

          {tenants.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No Centers
            </div>
          ) : filteredTenants.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No centers match the filters
            </div>
          ) : (
            <>
              <div className="w-full overflow-x-auto">
                <Table className="min-w-200">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Institute Name</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredTenants.map((tenant) => (
                      <TableRow key={tenant._id}>
                        <TableCell className="font-medium capitalize">
                          {tenant.name}
                        </TableCell>

                        <TableCell className="capitalize">
                          {tenant.ownerUserId?.name || "N/A"}
                        </TableCell>

                        <TableCell>
                          {tenant.ownerUserId?.email || "N/A"}
                        </TableCell>

                        <TableCell className="capitalize">
                          {tenant.plan}
                        </TableCell>

                        <TableCell>
                          <span
                            className={`px-3 py-1 text-xs rounded-full font-medium ${tenant.status === "inactive"
                                ? "bg-yellow-100 text-yellow-800"
                                : tenant.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                          >
                            {tenant.status === "blocked" ? "Suspended" : tenant.status}
                          </span>
                        </TableCell>

                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                className="capitalize w-20 border-2 "
                                variant="ghost"
                                size="sm"
                                disabled={isActionLoading}
                              >
                                {tenant.status === "blocked" ? "Suspended" : tenant.status}
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => openConfirmDialog(tenant._id, "approve")}
                              >
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openConfirmDialog(tenant._id, "inactive")}
                              >
                                Inactive
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => openConfirmDialog(tenant._id, "suspend")}
                                className="text-red-600"
                              >
                                Suspend
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openConfirmDialog(tenant._id, "delete")}
                                className="text-red-600"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      <ConfirmActionDialog
        open={Boolean(selectedTenantId && pendingAction)}
        onOpenChange={(open) => {
          if (!open) closeConfirmDialog();
        }}
        title={activeConfirm?.title}
        description={activeConfirm?.description}
        confirmText={activeConfirm?.confirmText}
        onConfirm={confirmAction}
        isConfirming={isActionLoading}
      />
    </div>
  );
}