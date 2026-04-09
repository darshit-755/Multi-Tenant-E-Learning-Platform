import { useForm } from "react-hook-form";
import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useCreateSubject } from "@/hooks/tenant/useCreateSubject";
import { useGetSubjects } from "@/hooks/tenant/useGetSubjects";
import { useUpdateSubject } from "@/hooks/tenant/useUpdateSubject";

import { toast } from "sonner";

export default function AddSubject() {
  const { mutateAsync: createSubject, isPending: isCreating } = useCreateSubject();
  const { mutateAsync: updateSubject, isPending: isUpdating } = useUpdateSubject();
  const { data: subjectsData, isLoading } = useGetSubjects();
  const [editingSubject, setEditingSubject] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {},
  });

  const isEditMode = Boolean(editingSubject);

  const onSubmit = async (data) => {
    const payload = {
      name: data.name,
      description: data.description,
    };

    const res = isEditMode
      ? await updateSubject({
          subjectId: editingSubject._id,
          data: payload,
        })
      : await createSubject(payload);

    if (res) {
      toast.success(
        isEditMode ? "Subject updated successfully!" : "Subject created successfully!",
      );
      reset({ name: "", description: "" });
      setEditingSubject(null);
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    reset({
      name: subject.name || "",
      description: subject.description || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingSubject(null);
    reset({ name: "", description: "" });
  };

  const handleToggleStatus = async (subject) => {
    const nextStatus = subject.status === "inactive" ? "active" : "inactive";

    const res = await updateSubject({
      subjectId: subject._id,
      data: { status: nextStatus },
    });

    if (res) {
      toast.success(`Subject ${nextStatus} successfully!`);
    }
  };

  const subjects = subjectsData?.subjects || [];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Add Subject</h1>
      </div>

      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label>Subject Name</Label>
              <Input
                placeholder="e.g. Mathematics"
                className="mt-1"
                {...register("name", { required: "Subject name is required" })}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label>Description</Label>
              <textarea
                placeholder="Short description"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none min-h-20"
                {...register("description")}
              />
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              {isEditMode && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="w-full md:w-40"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isCreating || isUpdating}
                className="bg-indigo-600 w-full md:w-40 hover:bg-indigo-700 text-white"
              >
                {isCreating || isUpdating
                  ? isEditMode
                    ? "Updating..."
                    : "Creating..."
                  : isEditMode
                    ? "Update Subject"
                    : "Create Subject"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">All Subjects</h2>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading subjects...</p>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Toggle</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.length > 0 ? (
                    subjects.map((subject) => (
                      <TableRow key={subject._id}>
                        <TableCell>{subject.name}</TableCell>
                        <TableCell>{subject.description || "-"}</TableCell>
                        <TableCell>
                          <span
                            className={`px-3 py-1 text-xs rounded-full font-medium ${
                              subject.status === "inactive"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {subject.status === "inactive" ? "Inactive" : "Active"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isUpdating}
                            onClick={() => handleToggleStatus(subject)}
                          >
                            {subject.status === "inactive" ? "Activate" : "Deactivate"}
                          </Button>
                        </TableCell>
                        <TableCell>
                          {new Date(subject.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(subject)}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm">
                        No subjects found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
