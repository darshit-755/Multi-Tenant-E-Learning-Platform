import { useForm } from "react-hook-form";
import { useState } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

import { toast } from "sonner";

export default function AddTutor() {
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
    formState: { errors },
  } = useForm();
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
      };
      const res = await updateTutor({
        tutorId: editingTutor._id,
        data: payload,
      });
      if (res) {
        toast.success("Tutor updated successfully!");
        setEditingTutor(null);
        reset();
      }
      return;
    }

    const { confirmPassword, ...payload } = data;

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
    setEditingTutor(tutor);
    setValue("name", tutor.name || "");
    setValue("email", tutor.email || "");
    setValue("password", "");
    setValue("experienceYears", tutor.experienceYears ?? 0);
    setValue("phone", tutor.phone || "");
    setSelectedSubject(tutor.subjects?.[0] || "");
  };

  const handleCancelEdit = () => {
    setEditingTutor(null);
    setSelectedSubject("");
    reset();
  };

  const subjects = subjectsData?.subjects || [];
  const activeSubjects = subjects.filter(
    (subject) => subject.status === "active",
  );

  const handleToggleStatus = async (tutor) => {
    const nextStatus = tutor.status === "inactive" ? "active" : "inactive";

    const res = await updateTutor({
      tutorId: tutor._id,
      data: { status: nextStatus },
    });

    if (res) {
      toast.success(`Tutor ${nextStatus} successfully!`);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Add Tutor</h1>
      </div>

      {/* Add Tutor Form */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                placeholder="Phone number"
                className="mt-1"
                {...register("phone", {
                  required: "Phone is required",
                })}
              />
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

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

      {/* Tutors Table */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">All Tutors</h2>

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
                    <TableHead>Toggle</TableHead>
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

                        {/* Toggle Status */}
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleStatus(tutor)}
                            disabled={isUpdating}
                          >
                            {tutor.status === "inactive"
                              ? "Activate"
                              : "Deactivate"}
                          </Button>
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
