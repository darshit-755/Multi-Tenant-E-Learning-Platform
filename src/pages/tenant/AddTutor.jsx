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
  const isAddPage = location.pathname === "/tenant/tutors/add";
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
  const [selectedSubject, setSelectedSubject] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const isEditMode = Boolean(editingTutor);

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
  register("subject", { required: "Subject is required" });

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
    if (!selectedSubject) {
      toast.error("Please select a subject");
      return;
    }

    if (isEditMode) {
      const payload = {
        name: data.name,
        email: data.email,
        subjects: [selectedSubject],
        experienceYears: data.experienceYears,
        phone: data.phone,
        status: data.status,
      };
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
      subjects: [selectedSubject],
    });
    if (res) {
      toast.success("Tutor created successfully!");
      reset();
      setSelectedSubject("");
    }
  };

  const handleEdit = (tutor) => {
    navigate(`/tenant/tutors/edit/${tutor._id}`);
  };

  const handleCancelEdit = () => {
    setEditingTutor(null);
    setSelectedSubject("");
    reset();
    if (isEditPage) {
      navigate("/tenant/tutors/view");
    }
  };

  const subjects = subjectsData?.subjects || [];
  const activeSubjects = subjects.filter(
    (subject) => subject.status === "active",
  );

  useEffect(() => {
    if (!isEditPage || !tutors?.tutors?.length) return;
    const tutor = tutors.tutors.find((item) => item._id === tutorId);
    if (!tutor) return;

    setEditingTutor(tutor);
    setValue("name", tutor.name || "");
    setValue("email", tutor.email || "");
    setValue("password", "");
    setValue("experienceYears", tutor.experienceYears ?? 0);
    setValue("phone", normalizeIndianMobileNumber(tutor.phone || ""));
    setValue("status", tutor.status || "active");
    setSelectedSubject(tutor.subjects?.[0] || "");
  }, [isEditPage, tutors, tutorId, setValue]);

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
              <Label>Password</Label>
              <div className="relative mt-1">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 6 characters"
                  className="pr-10"
                  {...register("password", {
                    required: isEditMode ? false : "Password is required",
                    minLength: {
                      value: 6,
                      message: "Minimum 6 characters",
                    },
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
              <Select
                value={selectedSubject}
                onValueChange={(value) => {
                  setSelectedSubject(value);
                  setValue("subject", value, { shouldValidate: true });
                }}
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {activeSubjects.length > 0 ? (
                    activeSubjects.map((subject) => (
                      <SelectItem key={subject._id} value={subject.name}>
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
              {errors.subject && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.subject.message}
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
                  {tutors?.tutors?.length > 0 ? (
                    tutors.tutors.map((tutor) => (
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
                            className={`px-3 py-1 text-xs rounded-full font-medium ${
                              tutor.status === "inactive"
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
                        No tutors found
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
