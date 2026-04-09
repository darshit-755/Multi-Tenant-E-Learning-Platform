import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { useGetOnlineUsers } from "@/hooks/admin/useGetOnlineUsers";
import { getAllBatchesApi } from "@/services/admin.api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const { data } = useGetOnlineUsers();
  const { data: batchesData } = useQuery({
    queryKey: ["dashboard-batches"],
    queryFn: () => getAllBatchesApi(1, 1000),
  });

  const [activeTable, setActiveTable] = useState(null);
  const { control: usersControl, watch: watchUsers, reset: resetUsers } = useForm({
    defaultValues: {
      roleFilter: "all",
      sortFilter: "name-asc",
      searchTerm: ""
    }
  });

  const { control: batchesControl, watch: watchBatches, reset: resetBatches } = useForm({
    defaultValues: {
      batchStatusFilter: "all",
      batchSortFilter: "name-asc",
      batchSearchTerm: ""
    }
  });

  const usersFilters = watchUsers();
  const batchesFilters = watchBatches();
  const { roleFilter, sortFilter, searchTerm } = usersFilters;
  const { batchStatusFilter, batchSortFilter, batchSearchTerm } = batchesFilters;

  const users = data?.data?.data || [];
  const batches = batchesData?.data?.batches || [];
  const totalBatches = batchesData?.data?.totalBatches || batches.length;
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const normalizedBatchSearch = batchSearchTerm.trim().toLowerCase();

  
  const filteredUsers = [...users]
    .filter((u) => u.role !== "superadmin")
    .filter((u) => (roleFilter === "all" ? true : u.role === roleFilter))
    .filter((u) => {
      if (!normalizedSearch) return true;

      return (
        String(u.name || "").toLowerCase().includes(normalizedSearch) ||
        String(u.email || "").toLowerCase().includes(normalizedSearch) ||
        String(u.role || "").toLowerCase().includes(normalizedSearch)
      );
    })
    .sort((a, b) => {
      if (sortFilter === "name-desc") {
        return String(b.name || "").localeCompare(String(a.name || ""));
      }
      if (sortFilter === "role") {
        return String(a.role || "").localeCompare(String(b.role || ""));
      }
      return String(a.name || "").localeCompare(String(b.name || ""));
    });

  const filteredBatches = [...batches]
    .filter((batch) => {
      if (!normalizedBatchSearch) return true;

      return (
        String(batch.name || "").toLowerCase().includes(normalizedBatchSearch) ||
        String(batch.tenantId?.name || "")
          .toLowerCase()
          .includes(normalizedBatchSearch) ||
        String(batch.subjectId?.name || "")
          .toLowerCase()
          .includes(normalizedBatchSearch) ||
        String(batch.teacherId?.userId?.name || "")
          .toLowerCase()
          .includes(normalizedBatchSearch)
      );
    })
    .filter((batch) =>
      batchStatusFilter === "all" ? true : String(batch.status || "") === batchStatusFilter
    )
    .sort((a, b) => {
      if (batchSortFilter === "name-desc") {
        return String(b.name || "").localeCompare(String(a.name || ""));
      }

      if (batchSortFilter === "status") {
        return String(a.status || "").localeCompare(String(b.status || ""));
      }

      return String(a.name || "").localeCompare(String(b.name || ""));
    });

  const clearFilters = () => {
    resetUsers({
      roleFilter: "all",
      sortFilter: "name-asc",
      searchTerm: ""
    });
  };

  const clearBatchFilters = () => {
    resetBatches({
      batchStatusFilter: "all",
      batchSortFilter: "name-asc",
      batchSearchTerm: ""
    });
  };

  return (
    <div className="w-full p-4 space-y-6">

      {/* Page Title */}
      <h1 className="text-2xl font-semibold tracking-tight">
        Dashboard
      </h1>

      {/* Online Users Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

        <Card
          onClick={() =>
            setActiveTable((prev) => (prev === "users" ? null : "users"))
          }
          className="cursor-pointer hover:shadow-md transition"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Online Users
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-3xl font-bold">
              {filteredUsers.length}
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() =>
            setActiveTable((prev) => (prev === "batches" ? null : "batches"))
          }
          className="cursor-pointer hover:shadow-md transition"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Batches
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-3xl font-bold">{totalBatches}</div>
          </CardContent>
        </Card>

      </div>

      {/* Table Section */}
      {activeTable === "users" && (
        <Card>

          <CardHeader className="space-y-4">

            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Online Users
              </CardTitle>
              <Button type="button" variant="outline" onClick={clearFilters}>
                Reset Filters
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Controller
                name="searchTerm"
                control={usersControl}
                render={({ field }) => (
                  <input
                    type="text"
                    {...field}
                    placeholder="Search name, email, role"
                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
                  />
                )}
              />

              <Controller
                name="roleFilter"
                control={usersControl}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filter role" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="tenant">Tenant</SelectItem>
                      <SelectItem value="tutor">Tutor</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />

              <Controller
                name="sortFilter"
                control={usersControl}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="name-asc">Sort: Name A-Z</SelectItem>
                      <SelectItem value="name-desc">Sort: Name Z-A</SelectItem>

                    </SelectContent>
                  </Select>
                )}
              />
            </div>

          </CardHeader>

          <CardContent>

            <Table>

              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>

                {filteredUsers.map((user) => (
                  <TableRow key={user._id}>

                    <TableCell className="font-medium flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      {user.name}
                    </TableCell>

                    <TableCell>{user.email}</TableCell>

                    <TableCell className="capitalize">
                      {user.role}
                    </TableCell>

                  </TableRow>
                ))}

                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-muted-foreground"
                    >
                      No users online
                    </TableCell>
                  </TableRow>
                )}

              </TableBody>

            </Table>

          </CardContent>

        </Card>
      )}

      {activeTable === "batches" && (
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">All Batches</CardTitle>
              <Button type="button" variant="outline" onClick={clearBatchFilters}>
                Reset Filters
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Controller
                name="batchSearchTerm"
                control={batchesControl}
                render={({ field }) => (
                  <input
                    type="text"
                    {...field}
                    placeholder="Search batch, tenant, subject, teacher"
                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
                  />
                )}
              />

              <Controller
                name="batchStatusFilter"
                control={batchesControl}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filter status" />
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
                name="batchSortFilter"
                control={batchesControl}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="name-asc">Sort: Name A-Z</SelectItem>
                      <SelectItem value="name-desc">Sort: Name Z-A</SelectItem>
                      <SelectItem value="status">Sort: Status</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredBatches.map((batch) => (
                  <TableRow key={batch._id}>
                    <TableCell className="font-medium">{batch.name || "N/A"}</TableCell>
                    <TableCell>{batch.tenantId?.name || "N/A"}</TableCell>
                    <TableCell>{batch.subjectId?.name || "N/A"}</TableCell>
                    <TableCell>{batch.teacherId?.userId?.name || "N/A"}</TableCell>
                    <TableCell>{batch.studentIds?.length || 0}</TableCell>
                    <TableCell className="capitalize">{batch.status || "N/A"}</TableCell>
                  </TableRow>
                ))}

                {filteredBatches.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground"
                    >
                      No batches found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

    </div>
  );
};

export default AdminDashboard;