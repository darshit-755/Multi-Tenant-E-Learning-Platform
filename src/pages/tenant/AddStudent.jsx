import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

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

const CLASS_LEVEL_OPTIONS = Array.from({ length: 12 }, (_, index) =>
  String(index + 1),
);
const BOARD_OPTIONS = ["CBSC", "NCERT", "State Board", "Other"];

export default function AddStudent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { studentId } = useParams();
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [classLevelQuery, setClassLevelQuery] = useState("");
  const [showClassLevelOptions, setShowClassLevelOptions] = useState(false);
  const ALL_VALUE = "__all";
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    status: ALL_VALUE,
  });
  const isEditMode = Boolean(editingStudent);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm();
  const statusValue = watch("status");
  const classLevelValue = watch("classLevel");
  const boardValue = watch("board");
  const isOtherBoardSelected = boardValue === "Other";
  const filteredClassLevelOptions = CLASS_LEVEL_OPTIONS.filter((level) =>
    level.toLowerCase().includes(String(classLevelQuery || "").toLowerCase()),
  );

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
        board: data.board === "Other" ? data.otherBoard : data.board,
        phone: data.phone,
        fatherName: data.fatherName,
        motherName: data.motherName,
        status: data.status,
      };
      if (String(data.password || "").trim()) {
        payload.password = data.password;
      }
      const res = await updateStudent({
        studentId: editingStudent._id,
        data: payload,
      });
      if (res) {
        toast.success("Student updated successfully!");
        setEditingStudent(null);
        setClassLevelQuery("");
        reset();
        navigate("/tenant/students/view");
      }
      return;
    }

    const { confirmPassword: _confirmPassword, ...payload } = data;

    payload.board = data.board === "Other" ? data.otherBoard : data.board;

    const res = await createStudent(payload);
    if (res) {
      toast.success("Student created successfully!");
      setClassLevelQuery("");
      reset();
    }
  };

  const handleEdit = (student) => {
    navigate(`/tenant/students/edit/${student._id}`);
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
    setClassLevelQuery("");
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
    setClassLevelQuery(student.classLevel || "");
    if (BOARD_OPTIONS.includes(student.board)) {
      setValue("board", student.board || "");
      setValue("otherBoard", "");
    } else {
      setValue("board", student.board ? "Other" : "");
      setValue("otherBoard", student.board || "");
    }
    setValue("phone", normalizeIndianMobileNumber(student.phone || ""));
    setValue("fatherName", student.fatherName || "");
    setValue("motherName", student.motherName || "");
    setValue("status", student.status || "active");
  }, [isEditPage, students, studentId, setValue]);

  const allStudents = students?.students || [];
  const filteredStudents = allStudents.filter((student) => {
    const nameMatch =
      !filters.name ||
      String(student.name || "").toLowerCase().includes(filters.name.toLowerCase());
    const emailMatch =
      !filters.email ||
      String(student.email || "")
        .toLowerCase()
        .includes(filters.email.toLowerCase());
    const statusMatch =
      filters.status === ALL_VALUE || String(student.status) === filters.status;
    return nameMatch && emailMatch && statusMatch;
  });

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
              <Label>{isEditMode ? "Password (Optional)" : "Password"}</Label>
              <div className="relative mt-1">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={isEditMode ? "Leave blank to keep current password" : "Minimum 6 characters"}
                  className="pr-10"
                  {...register("password", {
                    required: isEditMode ? false : "Password is required",
                    validate: (value) =>
                      !value || value.length >= 6 || "Minimum 6 characters",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {!isEditMode && (
              <div>
                <Label>Confirm Password</Label>
                <div className="relative mt-1">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    className="pr-10"
                    {...register("confirmPassword", {
                      required: "Confirm password is required",
                      validate: (value) =>
                        value === getValues("password") ||
                        "Passwords do not match",
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            )}

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
              <div className="relative mt-1">
                <Input
                  placeholder="Select or type class level"
                  value={classLevelQuery}
                  onFocus={() => setShowClassLevelOptions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowClassLevelOptions(false), 150)
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    setClassLevelQuery(value);
                    setValue("classLevel", value, { shouldValidate: true });
                    setShowClassLevelOptions(true);
                  }}
                />
                <input
                  type="hidden"
                  {...register("classLevel", {
                    required: "Class level is required",
                  })}
                />
                {showClassLevelOptions && (
                  <div className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border bg-white shadow-md">
                    {filteredClassLevelOptions.length > 0 ? (
                      filteredClassLevelOptions.map((level) => (
                        <button
                          key={level}
                          type="button"
                          className={`block w-full px-3 py-2 text-left text-sm hover:bg-slate-100 ${
                            classLevelValue === level ? "bg-slate-100" : ""
                          }`}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setClassLevelQuery(level);
                            setValue("classLevel", level, { shouldValidate: true });
                            setShowClassLevelOptions(false);
                          }}
                        >
                          {level}
                        </button>
                      ))
                    ) : (
                      <p className="px-3 py-2 text-sm text-muted-foreground">
                        No class level found
                      </p>
                    )}
                  </div>
                )}
              </div>
              {errors.classLevel && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.classLevel.message}
                </p>
              )}
            </div>

            <div>
              <Label>Board</Label>
              <Select
                value={boardValue || ""}
                onValueChange={(value) => {
                  setValue("board", value, { shouldValidate: true });
                  if (value !== "Other") {
                    setValue("otherBoard", "", { shouldValidate: false });
                  }
                }}
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="Select board" />
                </SelectTrigger>
                <SelectContent>
                  {BOARD_OPTIONS.map((board) => (
                    <SelectItem key={board} value={board}>
                      {board}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input
                type="hidden"
                {...register("board", { required: "Board is required" })}
              />
              {isOtherBoardSelected && (
                <Input
                  placeholder="Enter board name"
                  className="mt-3"
                  {...register("otherBoard", {
                    validate: (value) =>
                      boardValue !== "Other" ||
                      !!String(value || "").trim() ||
                      "Board name is required",
                  })}
                />
              )}
              {errors.board && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.board.message}
                </p>
              )}
              {errors.otherBoard && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.otherBoard.message}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Father Name</Label>
                <Input
                  placeholder="Father name"
                  className="mt-1"
                  {...register("fatherName")}
                />
                {errors.fatherName && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.fatherName.message}
                  </p>
                )}
              </div>

              <div>
                <Label>Mother Name</Label>
                <Input
                  placeholder="Mother name"
                  className="mt-1"
                  {...register("motherName")}
                />
                {errors.motherName && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.motherName.message}
                  </p>
                )}
              </div>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <Input
              placeholder="Filter by name"
              value={filters.name}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <Input
              placeholder="Filter by email"
              value={filters.email}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, email: e.target.value }))
              }
            />
            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() =>
                setFilters({ name: "", email: "", status: ALL_VALUE })
              }
            >
              Reset Filters
            </Button>
          </div>

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
                    <TableHead>Father</TableHead>
                    <TableHead>Mother</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <TableRow
                        key={student._id}
                        className="cursor-pointer"
                        onClick={() => navigate(`/tenant/students/${student._id}`)}
                      >
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.rollNumber || "-"}</TableCell>
                        <TableCell>{student.classLevel || "-"}</TableCell>
                        <TableCell>{student.board || "-"}</TableCell>
                        <TableCell>{student.phone || "-"}</TableCell>
                        <TableCell>{student.fatherName || "-"}</TableCell>
                        <TableCell>{student.motherName || "-"}</TableCell>

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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(student);
                            }}
                          >
                            Edit
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(student._id);
                            }}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center text-sm">
                        {allStudents.length === 0
                          ? "No students found"
                          : "No students match the filters"}
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
