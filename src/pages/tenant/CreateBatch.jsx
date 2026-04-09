import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";

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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useCreateBatch } from "@/hooks/tenant/useCreateBatch";
import { useGetBatches } from "@/hooks/tenant/useGetBatches";
import { useUpdateBatch } from "@/hooks/tenant/useUpdateBatch";
import { useGetSubjects } from "@/hooks/tenant/useGetSubjects";
import { useGetTutors } from "@/hooks/tenant/useGetTutors";
import { useGetStudents } from "@/hooks/tenant/useGetStudents";

import { toast } from "sonner";

export default function CreateBatch() {
  const { mutateAsync: createBatch, isPending: isCreating } = useCreateBatch();
  const { mutateAsync: updateBatch, isPending: isUpdating } = useUpdateBatch();
  const { data: batchesData, isLoading } = useGetBatches();
  const { data: subjectsData } = useGetSubjects();
  const { data: tutorsData } = useGetTutors();
  const { data: studentsData } = useGetStudents();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [editingBatch, setEditingBatch] = useState(null);

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const studentDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        studentDropdownRef.current &&
        !studentDropdownRef.current.contains(e.target)
      ) {
        setShowStudentDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const subjects = subjectsData?.subjects || [];
  const tutors = tutorsData?.tutors || [];
  const students = studentsData?.students || [];
  const batches = batchesData?.batches || [];

  const activeStudents = students.filter((s) => s.status === "active");

  const toggleStudent = (studentIdValue) => {
    setSelectedStudents((prev) =>
      prev.includes(studentIdValue)
        ? prev.filter((id) => id !== studentIdValue)
        : [...prev, studentIdValue],
    );
  };
  const isAllSelected =
    activeStudents.length > 0 &&
    selectedStudents.length === activeStudents.length;

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      setSelectedStudents([]);
    } else {
      const allIds = activeStudents.map((s) => s.studentId);
      setSelectedStudents(allIds);
    }
  };

  const selectedSubject = subjects.find(
    (subject) => subject._id === selectedSubjectId,
  );

  const filteredTutors = tutors.filter((tutor) => {
    if (tutor.status !== "active") return false;
    if (!selectedSubject) return false;

    const tutorSubjects = tutor.subjects || [];
    const selectedSubjectName = selectedSubject.name?.trim().toLowerCase();

    const matchesBySubjectName = tutorSubjects.some(
      (tutorSubject) =>
        String(tutorSubject).trim().toLowerCase() === selectedSubjectName,
    );

    const matchesBySubjectId =
      tutor.subjectId?._id === selectedSubjectId ||
      tutor.subjectId === selectedSubjectId;

    return matchesBySubjectName || matchesBySubjectId;
  });

  const onSubmit = async (data) => {
    if (!selectedSubjectId || !selectedTeacherId) {
      toast.error("Please select subject and teacher");
      return;
    }

    if (editingBatch) {
      const payload = {
        name: data.name,
      };
      const res = await updateBatch({
        batchId: editingBatch._id,
        data: payload,
      });
      if (res) {
        toast.success("Batch updated successfully!");
        handleCancelEdit();
      }
      return;
    }

    const payload = {
      name: data.name,
      subjectId: selectedSubjectId,
      teacherId: selectedTeacherId,
      studentIds: selectedStudents,
    };

    const res = await createBatch(payload);
    if (res) {
      toast.success("Batch created successfully!");
      reset({ name: "" });
      setSelectedSubjectId("");
      setSelectedTeacherId("");
      setSelectedStudents([]);
      setShowStudentDropdown(false);
    }
  };

  const handleEdit = (batch) => {
    setEditingBatch(batch);
    setValue("name", batch.name || "");
    setSelectedSubjectId(batch.subjectId?._id || "");
    setSelectedTeacherId(batch.teacherId?._id || "");
  };

  const handleCancelEdit = () => {
    setEditingBatch(null);
    setSelectedSubjectId("");
    setSelectedTeacherId("");
    setSelectedStudents([]);
    setShowStudentDropdown(false);
    reset();
  };

  const handleToggleStatus = async (batch) => {
    const nextStatus = batch.status === "completed" ? "active" : "completed";
    const res = await updateBatch({
      batchId: batch._id,
      data: { status: nextStatus },
    });
    if (res) {
      toast.success(`Batch marked as ${nextStatus}!`);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Create Batch</h1>
      </div>

      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label>Batch Name</Label>
              <Input
                placeholder="e.g. Batch A"
                className="mt-1"
                {...register("name", { required: "Batch name is required" })}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label>Subject</Label>
              <Select
                value={selectedSubjectId}
                onValueChange={(value) => {
                  setSelectedSubjectId(value);
                  setSelectedTeacherId("");
                  setValue("subjectId", value, { shouldValidate: true });
                }}
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects
                    .filter((subject) => subject.status === "active")
                    .map((subject) => (
                      <SelectItem key={subject._id} value={subject._id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <input
                type="hidden"
                {...register("subjectId", { required: "Subject is required" })}
              />
              {errors.subjectId && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.subjectId.message}
                </p>
              )}
            </div>

            <div>
              <Label>Teacher</Label>
              <Select
                value={selectedTeacherId}
                onValueChange={(value) => {
                  setSelectedTeacherId(value);
                  setValue("teacherId", value, { shouldValidate: true });
                }}
                disabled={!selectedSubjectId}
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {selectedSubjectId ? (
                    filteredTutors.length > 0 ? (
                      filteredTutors.map((tutor) => (
                        <SelectItem key={tutor.tutorId} value={tutor.tutorId}>
                          {tutor.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No teachers available
                      </div>
                    )
                  ) : (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      Select a subject first
                    </div>
                  )}
                </SelectContent>
              </Select>
              <input
                type="hidden"
                {...register("teacherId", { required: "Teacher is required" })}
              />
              {errors.teacherId && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.teacherId.message}
                </p>
              )}
            </div>

            <div className="relative" ref={studentDropdownRef}>
              <Label>Students</Label>
              <button
                type="button"
                onClick={() => setShowStudentDropdown((prev) => !prev)}
                className="mt-1 w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm hover:bg-accent focus:outline-none"
              >
                <span className="text-muted-foreground">
                  {selectedStudents.length > 0
                    ? `${selectedStudents.length} student(s) selected`
                    : "Select students"}
                </span>
              </button>

              {showStudentDropdown && (
                <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md max-h-56 overflow-auto">
                  <label className="flex items-center gap-2 px-3 py-2 text-sm border-b cursor-pointer bg-muted">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAllToggle}
                    />
                    <span className="font-medium">Select All</span>
                  </label>

                  {/* Students List */}
                  {activeStudents.length > 0 ? (
                    activeStudents.map((student) => (
                      <label
                        key={student.studentId}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.studentId)}
                          onChange={() => toggleStudent(student.studentId)}
                        />
                        {student.name}
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground px-3 py-2">
                      No active students
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t">
              {editingBatch && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="w-full md:w-40 mr-2"
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
                  ? editingBatch
                    ? "Updating..."
                    : "Creating..."
                  : editingBatch
                    ? "Update Batch"
                    : "Create Batch"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">All Batches</h2>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading batches...</p>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.length > 0 ? (
                    batches.map((batch) => (
                      <TableRow key={batch._id}>
                        <TableCell>{batch.name}</TableCell>
                        <TableCell>{batch.subjectId?.name || "-"}</TableCell>
                        <TableCell>
                          {batch.teacherId?.userId?.name || "-"}
                        </TableCell>
                        <TableCell>{batch.studentIds?.length || 0}</TableCell>
                        <TableCell>
                          <span
                            className={`px-3 py-1 text-xs rounded-full font-medium ${
                              batch.status === "completed"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {batch.status === "completed"
                              ? "Completed"
                              : "Active"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(batch.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEdit(batch)}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(batch)}
                              >
                                {batch.status === "completed"
                                  ? "Mark Active"
                                  : "Mark Completed"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-sm">
                        No batches found
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
