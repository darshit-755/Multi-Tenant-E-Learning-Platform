import { useForm, Controller } from "react-hook-form";
import { useEffect, useState, useMemo } from "react";
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

import { useRegisterTutor } from "@/hooks/tenant/useRegisterTutor";
import { useGetTutors } from "@/hooks/tenant/useGetTutors";
import { useDeleteTutor } from "@/hooks/tenant/useDeleteTutor";
import { useUpdateTutor } from "@/hooks/tenant/useUpdateTutor";
import { useGetSubjects } from "@/hooks/tenant/useGetSubjects";
import ConfirmActionDialog from "@/components/common/ConfirmActionDialog";
import {
  handleIndianMobileInput,
  normalizeIndianMobileNumber,
  validateIndianMobileNumber,
} from "@/lib/phone";

import { toast } from "sonner";

export default function AddTutor() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tutorId } = useParams();
  const isViewPage = location.pathname === "/tenant/tutors/view";
  const isEditPage = Boolean(tutorId);
  const { mutateAsync: createTutor, isPending: isCreating } =
    useRegisterTutor();
  const { mutateAsync: updateTutor, isPending: isUpdating } = useUpdateTutor();
  const { data: tutors, isLoading } = useGetTutors();
  const { data: subjectsData } = useGetSubjects();
  const { mutate: deleteTutor, isPending: isDeleting } = useDeleteTutor();
  const [editingTutor, setEditingTutor] = useState(null);
  const [deleteTutorId, setDeleteTutorId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const ALL_VALUE = "__all";
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    subject: "",
    status: ALL_VALUE,
  });
  const isEditMode = Boolean(editingTutor);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      subjectId: "",
    },
  });
  const statusValue = watch("status");

  const handleDelete = (id) => {
    setDeleteTutorId(id);
  };

  const confirmDelete = () => {
    if (!deleteTutorId) return;

    deleteTutor(deleteTutorId, {
      onSuccess: () => {
        toast.success("Tutor deleted successfully!");
        setDeleteTutorId(null);
      },
    });
  };

  const onSubmit = async (data) => {
    if (!data.subjectId) {
      toast.error("Please select a subject");
      return;
    }

    const selectedSubjectName =
      subjectsData?.subjects?.find((subject) => subject._id === data.subjectId)
        ?.name || "";

    if (isEditMode) {
      const payload = {
        name: data.name,
        email: data.email,
        subjects: selectedSubjectName ? [selectedSubjectName] : [],
        experienceYears: data.experienceYears,
        phone: data.phone,
        status: data.status,
      };
      if (String(data.password || "").trim()) {
        payload.password = data.password;
      }
      const res = await updateTutor({
        tutorId: editingTutor._id,
        data: payload,
      });
      if (res) {
        toast.success("Tutor updated successfully!");
        setEditingTutor(null);
        reset();
        navigate("/tenant/tutors/view");
      }
      return;
    }

    const { confirmPassword: _confirmPassword, ...payload } = data;

    const res = await createTutor({
      ...payload,
      subjects: selectedSubjectName ? [selectedSubjectName] : [],
    });
    if (res) {
      toast.success("Tutor created successfully!");
      reset();
    }
  };

  const handleEdit = (tutor) => {
    navigate(`/tenant/tutors/edit/${tutor._id}`);
  };

  const handleCancelEdit = () => {
    setEditingTutor(null);
    reset();
    if (isEditPage) {
      navigate("/tenant/tutors/view");
    }
  };

  const subjects = useMemo(() => subjectsData?.subjects || [], [subjectsData]);
  const activeSubjects = useMemo(() => subjects.filter(
    (subject) => subject.status === "active",
  ), [subjects]);
  const subjectsForSelect = isEditMode ? subjects : activeSubjects;
  const hasSubjectsForTutor = subjectsForSelect.length > 0;
  const preselectedSubjectId = location.state?.preselectedSubjectId || "";

  useEffect(() => {
    if (!isEditPage) return;

    // wait for BOTH data
    if (!tutors?.tutors?.length || !subjects.length) return;

    const tutor = tutors.tutors.find((item) => item._id === tutorId);
    if (!tutor) return;

    setEditingTutor(tutor);
    const tutorPrimarySubjectName = tutor.subjects?.[0] || "";

    const matchedSubject = subjects.find((subject) =>
      subject.name?.trim().toLowerCase() ===
      String(tutorPrimarySubjectName).trim().toLowerCase()
    );

    const subjectId = matchedSubject?._id || "";

    reset({
      name: tutor.name || "",
      email: tutor.email || "",
      password: "",
      experienceYears: tutor.experienceYears ?? 0,
      phone: normalizeIndianMobileNumber(tutor.phone || ""),
      status: tutor.status || "active",
      subjectId: subjectId,
    });





  }, [isEditPage, tutors, subjects, tutorId, setValue]);

  useEffect(() => {
    if (isEditPage || !preselectedSubjectId || !subjectsForSelect.length) return;

    const matchedSubject = subjectsForSelect.find(
      (subject) => subject._id === preselectedSubjectId,
    );

    if (matchedSubject) {
      setValue("subjectId", matchedSubject._id, { shouldValidate: true });
    }
  }, [isEditPage, preselectedSubjectId, subjectsForSelect, setValue]);

  const allTutors = tutors?.tutors || [];
  const filteredTutors = allTutors.filter((tutor) => {
    const nameMatch =
      !filters.name ||
      String(tutor.name || "").toLowerCase().includes(filters.name.toLowerCase());
    const emailMatch =
      !filters.email ||
      String(tutor.email || "").toLowerCase().includes(filters.email.toLowerCase());
    const subjectMatch =
      !filters.subject ||
      String(tutor.subjects?.join(", ") || "")
        .toLowerCase()
        .includes(filters.subject.toLowerCase());
    const statusMatch =
      filters.status === ALL_VALUE || String(tutor.status) === filters.status;
    return nameMatch && emailMatch && subjectMatch && statusMatch;
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">
          {isViewPage ? "All Tutors" : isEditPage ? "Edit Tutor" : "Add Tutor"}
        </h1>
      </div>

      {!isViewPage && (
        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              {/* Name */}
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

              {/* Email */}
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

              {/* Password */}
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
                          value === getValues("password") || "Passwords do not match",
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700"
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              )}

              {/* Subjects */}
              <div>
                <Label>Subjects</Label>
                {!hasSubjectsForTutor && (
                  <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-3">
                    <p className="text-sm font-medium text-amber-900">
                      NO SUBJECT IS AVAILABLE
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-3"
                      onClick={() => navigate("/tenant/add-subject")}
                    >
                      Add Subject
                    </Button>
                  </div>
                )}
                <Controller
                  key={editingTutor?._id || "new"}
                  name="subjectId"
                  control={control}
                  rules={{ required: "Subject is required" }}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                    >
                      <SelectTrigger className="mt-1 w-full">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjectsForSelect.length > 0 ? (
                          subjectsForSelect.map((subject) => (
                            <SelectItem key={subject._id} value={subject._id}>
                              {subject.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="__no_subject" disabled>
                            Add subjects first to assign here
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.subjectId && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.subjectId.message}
                  </p>
                )}
              </div>

              {/* Experience */}
              <div>
                <Label>Experience (Years)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  className="mt-1"
                  {...register("experienceYears", {
                    required: "Experience is required",
                    min: {
                      value: 0,
                      message: "Experience must be 0 or greater",
                    },
                  })}
                />
                {errors.experienceYears && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.experienceYears.message}
                  </p>
                )}
              </div>

              {/* Phone */}
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
                      ? "Update Tutor"
                      : "Create Tutor"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isViewPage && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Tutors</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
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
              <Input
                placeholder="Filter by subject"
                value={filters.subject}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, subject: e.target.value }))
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
                  setFilters({
                    name: "",
                    email: "",
                    subject: "",
                    status: ALL_VALUE,
                  })
                }
              >
                Reset Filters
              </Button>
            </div>

            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading tutors...</p>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Subjects</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredTutors.length > 0 ? (
                      filteredTutors.map((tutor) => (
                        <TableRow key={tutor._id}>
                          <TableCell>{tutor.name}</TableCell>
                          <TableCell>{tutor.email}</TableCell>
                          <TableCell>
                            {tutor.subjects?.join(", ") || "-"}
                          </TableCell>
                          <TableCell>{tutor.experienceYears ?? "-"}</TableCell>
                          <TableCell>{tutor.phone || "-"}</TableCell>

                          {/* Status Badge */}
                          <TableCell>
                            <span
                              className={`px-3 py-1 text-xs rounded-full font-medium ${tutor.status === "inactive"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                                }`}
                            >
                              {tutor.status === "inactive"
                                ? "Inactive"
                                : "Active"}
                            </span>
                          </TableCell>

                          <TableCell>
                            {new Date(tutor.createdAt).toLocaleDateString()}
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(tutor)}
                            >
                              Edit
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(tutor._id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-sm">
                          {allTutors.length === 0
                            ? "No tutors found"
                            : "No tutors match the filters"}
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
        open={Boolean(deleteTutorId)}
        onOpenChange={(open) => {
          if (!open) setDeleteTutorId(null);
        }}
        title="Delete tutor?"
        description="This will permanently remove the tutor from your dashboard."
        confirmText="Delete"
        onConfirm={confirmDelete}
        isConfirming={isDeleting}
      />
    </div>
  );
}
