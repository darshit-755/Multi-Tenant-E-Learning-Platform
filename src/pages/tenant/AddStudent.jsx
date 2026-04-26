import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

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

import { useRegisterStudent } from "@/hooks/tenant/useRegisterStudent";
import { useGetStudents } from "@/hooks/tenant/useGetStudents";
import { useDeleteStudent } from "@/hooks/tenant/useDeleteStudent";
import { useUpdateStudent } from "@/hooks/tenant/useUpdateStudent";
import ConfirmActionDialog from "@/components/common/ConfirmActionDialog";
import {
  handleIndianMobileInput,
  normalizeIndianMobileNumber,
  validateIndianMobileNumber,
} from "@/lib/phone";

import { toast } from "sonner";

export default function AddStudent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { studentId } = useParams();
  const isAddPage = location.pathname === "/tenant/students/add";
  const isViewPage = location.pathname === "/tenant/students/view";
  const isEditPage = Boolean(studentId);
  const { mutateAsync: createStudent, isPending: isCreating } =
    useRegisterStudent();
  const { mutateAsync: updateStudent, isPending: isUpdating } =
    useUpdateStudent();
  const { data: students, isLoading } = useGetStudents();
  const { mutate: deleteStudent, isPending: isDeleting } = useDeleteStudent();
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleteStudentId, setDeleteStudentId] = useState(null);
  const isEditMode = Boolean(editingStudent);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm();
  const statusValue = watch("status");

  const handleDelete = (id) => {
    setDeleteStudentId(id);
  };

  const confirmDelete = () => {
    if (!deleteStudentId) return;

    deleteStudent(deleteStudentId, {
      onSuccess: () => {
        toast.success("Student deleted successfully!");
        setDeleteStudentId(null);
      },
    });
  };

  const onSubmit = async (data) => {
    if (isEditMode) {
      const payload = {
        name: data.name,
        email: data.email,
        rollNumber: data.rollNumber,
        classLevel: data.classLevel,
        board: data.board,
        phone: data.phone,
        parentName: data.parentName,
        status: data.status,
      };
      const res = await updateStudent({
        studentId: editingStudent._id,
        data: payload,
      });
      if (res) {
        toast.success("Student updated successfully!");
        setEditingStudent(null);
        reset();
        navigate("/tenant/students/view");
      }
      return;
    }

    const res = await createStudent(data);
    if (res) {
      toast.success("Student created successfully!");
      reset();
    }
  };

  const handleEdit = (student) => {
    navigate(`/tenant/students/edit/${student._id}`);
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
    reset();
    if (isEditPage) {
      navigate("/tenant/students/view");
    }
  };

  useEffect(() => {
    if (!isEditPage || !students?.students?.length) return;
    const student = students.students.find((item) => item._id === studentId);
    if (!student) return;

    setEditingStudent(student);
    setValue("name", student.name || "");
    setValue("email", student.email || "");
    setValue("password", "");
    setValue("rollNumber", student.rollNumber || "");
    setValue("classLevel", student.classLevel || "");
    setValue("board", student.board || "");
    setValue("phone", normalizeIndianMobileNumber(student.phone || ""));
    setValue("parentName", student.parentName || "");
    setValue("status", student.status || "active");
  }, [isEditPage, students, studentId, setValue]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">
          {isViewPage ? "All Students" : isEditPage ? "Edit Student" : "Add Student"}
        </h1>
      </div>

      {!isViewPage && (
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <div>
              <Label>Name</Label>
              <Input
                placeholder="Full name"
                className="mt-1"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="Email address"
                className="mt-1"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="Minimum 6 characters"
                className="mt-1"
                {...register("password", {
                  required: isEditMode ? false : "Password is required",
                  minLength: {
                    value: 6,
                    message: "Minimum 6 characters",
                  },
                })}
              />
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Label>Roll Number</Label>
              <Input
                placeholder="e.g. STU-101"
                className="mt-1"
                {...register("rollNumber", {
                  required: "Roll number is required",
                })}
              />
              {errors.rollNumber && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.rollNumber.message}
                </p>
              )}
            </div>

            <div>
              <Label>Class Level</Label>
              <Input
                placeholder="e.g. 10"
                className="mt-1"
                {...register("classLevel", {
                  required: "Class level is required",
                })}
              />
              {errors.classLevel && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.classLevel.message}
                </p>
              )}
            </div>

            <div>
              <Label>Board</Label>
              <Input
                placeholder="e.g. CBSE"
                className="mt-1"
                {...register("board", { required: "Board is required" })}
              />
              {errors.board && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.board.message}
                </p>
              )}
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                autoComplete="tel-national"
                placeholder="Phone number"
                className="mt-1"
                {...register("phone", {
                  required: "Phone is required",
                  setValueAs: normalizeIndianMobileNumber,
                  validate: validateIndianMobileNumber,
                })}
                onInput={handleIndianMobileInput}
              />
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <Label>Parent Name</Label>
              <Input
                placeholder="Parent full name"
                className="mt-1"
                {...register("parentName", {
                  required: "Parent name is required",
                })}
              />
              {errors.parentName && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.parentName.message}
                </p>
              )}
            </div>

            {isEditMode && (
              <div>
                <Label>Status</Label>
                <Select
                  value={statusValue || "active"}
                  onValueChange={(value) =>
                    setValue("status", value, { shouldValidate: true })
                  }
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex flex-col md:flex-row justify-center md:justify-end gap-2 pt-4 border-t">
              {isEditMode && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="w-full md:w-35"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isCreating || isUpdating}
                className="bg-indigo-600 w-full md:w-35 hover:bg-indigo-700 text-white"
              >
                {isCreating || isUpdating
                  ? isEditMode
                    ? "Updating..."
                    : "Creating..."
                  : isEditMode
                    ? "Update Student"
                    : "Create Student"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      )}

      {isViewPage && (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">All Students</h2>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading students...</p>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roll No.</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Board</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {students?.students?.length > 0 ? (
                    students.students.map((student) => (
                      <TableRow key={student._id}>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.rollNumber || "-"}</TableCell>
                        <TableCell>{student.classLevel || "-"}</TableCell>
                        <TableCell>{student.board || "-"}</TableCell>
                        <TableCell>{student.phone || "-"}</TableCell>
                        <TableCell>{student.parentName || "-"}</TableCell>

                        {/* Status Badge */}
                        <TableCell>
                          <span
                            className={`px-3 py-1 text-xs rounded-full font-medium ${
                              student.status === "inactive"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {student.status === "inactive"
                              ? "Inactive"
                              : "Active"}
                          </span>
                        </TableCell>

                        <TableCell>
                          {new Date(student.createdAt).toLocaleDateString()}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(student)}
                          >
                            Edit
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(student._id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-sm">
                        No students found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      )}

      <ConfirmActionDialog
        open={Boolean(deleteStudentId)}
        onOpenChange={(open) => {
          if (!open) setDeleteStudentId(null);
        }}
        title="Delete student?"
        description="This will permanently remove the student from your dashboard."
        confirmText="Delete"
        onConfirm={confirmDelete}
        isConfirming={isDeleting}
      />
    </div>
  );
}
