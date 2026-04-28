import { useState, useRef, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";

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
  const location = useLocation();
  const navigate = useNavigate();
  const { batchId } = useParams();
  const isViewPage = location.pathname === "/tenant/batches/view";
  const isEditPage = Boolean(batchId);
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

  const [selectedSubjectIdState, setSelectedSubjectId] = useState(null);
  const [selectedTeacherIdState, setSelectedTeacherId] = useState(null);
  const [selectedStudentsState, setSelectedStudents] = useState(null);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const ALL_VALUE = "__all";
  const [filters, setFilters] = useState({
    name: "",
    subject: ALL_VALUE,
    teacher: "",
    status: ALL_VALUE,
  });
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

  const subjects = useMemo(() => subjectsData?.subjects || [], [subjectsData]);
  const tutors = useMemo(() => tutorsData?.tutors || [], [tutorsData]);
  const students = useMemo(() => studentsData?.students || [], [studentsData]);
  const batches = useMemo(() => batchesData?.batches || [], [batchesData]);
  const editingBatch = useMemo(
    () => (isEditPage ? batches.find((item) => item._id === batchId) || null : null),
    [isEditPage, batches, batchId],
  );
  const prefilledSubjectId =
    editingBatch?.subjectId?._id || editingBatch?.subjectId || "";
  const prefilledTeacherId =
    editingBatch?.teacherId?.tutorId ||
    editingBatch?.teacherId?._id ||
    editingBatch?.teacherId ||
    "";
  const prefilledStudentIds = useMemo(
    () =>
      (editingBatch?.studentIds || [])
        .map((student) => student.studentId || student._id || student)
        .filter(Boolean),
    [editingBatch],
  );
  const selectedSubjectId = selectedSubjectIdState ?? prefilledSubjectId;
  const selectedTeacherId = selectedTeacherIdState ?? prefilledTeacherId;
  const selectedStudents = selectedStudentsState ?? prefilledStudentIds;

  const getStudentId = (student) =>
    student?.studentId || student?._id || student?.id || "";
  const getTutorId = (tutor) => tutor?.tutorId || tutor?._id || "";

  const activeStudents = students.filter((s) => s.status === "active");
  const studentsForSelect =
    editingBatch?.studentIds?.length > 0 ? students : activeStudents;

  const toggleStudent = (studentIdValue) => {
    setSelectedStudents((prev) => {
      const current = prev ?? prefilledStudentIds;
      const next = current.includes(studentIdValue)
        ? current.filter((id) => id !== studentIdValue)
        : [...current, studentIdValue];
      setValue("studentIds", next, { shouldValidate: true });
      return next;
    });
  };
  const isAllSelected =
    studentsForSelect.length > 0 &&
    selectedStudents.length === studentsForSelect.length;

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      setSelectedStudents([]);
      setValue("studentIds", [], { shouldValidate: true });
    } else {
      const allIds = studentsForSelect.map((s) => getStudentId(s)).filter(Boolean);
      setSelectedStudents(allIds);
      setValue("studentIds", allIds, { shouldValidate: true });
    }
  };

  const selectedSubject = subjects.find(
    (subject) => subject._id === selectedSubjectId,
  );

  const filteredTutors = tutors.filter((tutor) => {
    const tutorId = getTutorId(tutor);
    const isCurrentTeacher = isEditPage && tutorId === selectedTeacherId;
    if (tutor.status !== "active" && !isCurrentTeacher) return false;
    if (!selectedSubject) return isCurrentTeacher;

    const tutorSubjects = tutor.subjects || [];
    const selectedSubjectName = selectedSubject.name?.trim().toLowerCase();

    const matchesBySubjectName = tutorSubjects.some(
      (tutorSubject) =>
        String(tutorSubject).trim().toLowerCase() === selectedSubjectName,
    );

    const matchesBySubjectId =
      tutor.subjectId?._id === selectedSubjectId ||
      tutor.subjectId === selectedSubjectId;

    return matchesBySubjectName || matchesBySubjectId || isCurrentTeacher;
  });
  const subjectsForSelect = isEditPage
    ? subjects
    : subjects.filter((subject) => subject.status === "active");
  const hasSubjectsForBatch = subjectsForSelect.length > 0;
  const selectedSubjectName = selectedSubject?.name || "this subject";
  const hasTutorsForSelectedSubject = filteredTutors.length > 0;
  const filteredBatches = batches.filter((batch) => {
    const nameMatch =
      !filters.name ||
      String(batch.name || "").toLowerCase().includes(filters.name.toLowerCase());
    const subjectMatch =
      filters.subject === ALL_VALUE ||
      String(batch.subjectId?.name || "") === filters.subject;
    const teacherMatch =
      !filters.teacher ||
      String(batch.teacherId?.userId?.name || "")
        .toLowerCase()
        .includes(filters.teacher.toLowerCase());
    const statusMatch =
      filters.status === ALL_VALUE || String(batch.status || "") === filters.status;
    return nameMatch && subjectMatch && teacherMatch && statusMatch;
  });
  const uniqueSubjects = [
    ...new Set(batches.map((batch) => batch.subjectId?.name).filter(Boolean)),
  ];

  const onSubmit = async (data) => {
    if (!selectedSubjectId || !selectedTeacherId) {
      toast.error("Please select subject and teacher");
      return;
    }

    if (editingBatch) {
      const payload = {
        name: data.name,
        subjectId: selectedSubjectId,
        teacherId: selectedTeacherId,
        studentIds: selectedStudents,
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
      setValue("studentIds", [], { shouldValidate: false });
      setShowStudentDropdown(false);
    }
  };

  const handleEdit = (batch) => {
    navigate(`/tenant/batches/edit/${batch._id}`);
  };

  const handleCancelEdit = () => {
    setSelectedSubjectId(null);
    setSelectedTeacherId(null);
    setSelectedStudents(null);
    setValue("studentIds", [], { shouldValidate: false });
    setShowStudentDropdown(false);
    reset();
    if (isEditPage) {
      navigate("/tenant/batches/view");
    }
  };

  useEffect(() => {
    if (!editingBatch) return;

    setValue("name", editingBatch.name || "");
    setValue("subjectId", prefilledSubjectId, { shouldValidate: true });
    setValue("teacherId", prefilledTeacherId, { shouldValidate: true });
    setValue("studentIds", prefilledStudentIds, { shouldValidate: false });
  }, [
    editingBatch,
    prefilledSubjectId,
    prefilledTeacherId,
    prefilledStudentIds,
    setValue,
  ]);

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
        <h1 className="text-2xl font-semibold text-slate-800">
          {isViewPage ? "All Batches" : isEditPage ? "Edit Batch" : "Create Batch"}
        </h1>
      </div>

      {!isViewPage && (
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
              {!hasSubjectsForBatch && (
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
              <Select
                key={`subject-${editingBatch?._id || "new"}`}
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
                  {subjectsForSelect.length > 0 ? (
                    subjectsForSelect.map((subject) => (
                      <SelectItem key={subject._id} value={subject._id}>
                        {subject.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No subjects available. Add a subject first.
                    </div>
                  )}
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
              {selectedSubjectId && !hasTutorsForSelectedSubject && (
                <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-3">
                  <p className="text-sm font-medium text-amber-900">
                    There is no teacher availble for this subject please add teacher.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3"
                    onClick={() =>
                      navigate("/tenant/tutors/add", {
                        state: { preselectedSubjectId: selectedSubjectId },
                      })
                    }
                  >
                    Add Tutor for {selectedSubjectName}
                  </Button>
                </div>
              )}
              <Select
                key={`teacher-${editingBatch?._id || "new"}-${selectedSubjectId}`}
                value={selectedTeacherId}
                onValueChange={(value) => {
                  setSelectedTeacherId(value);
                  setValue("teacherId", value, { shouldValidate: true });
                }}
                disabled={!selectedSubjectId}
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder={selectedSubjectId ? "Select teacher" : "Please select subject first"} />
                </SelectTrigger>
                <SelectContent>
                  {selectedSubjectId ? (
                    filteredTutors.length > 0 ? (
                      filteredTutors.map((tutor) => (
                        <SelectItem
                          key={getTutorId(tutor)}
                          value={getTutorId(tutor)}
                        >
                          {tutor.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No tutor available for this subject. Add a tutor for this subject first.
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
              <input type="hidden" {...register("studentIds")} />
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
                  {studentsForSelect.length > 0 ? (
                    studentsForSelect.map((student) => (
                      <label
                        key={getStudentId(student)}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(getStudentId(student))}
                          onChange={() => toggleStudent(getStudentId(student))}
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
      )}

      {isViewPage && (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">All Batches</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
            <Input
              placeholder="Filter by batch name"
              value={filters.name}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <Select
              value={filters.subject}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, subject: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All Subjects</SelectItem>
                {uniqueSubjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Filter by teacher"
              value={filters.teacher}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, teacher: e.target.value }))
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
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() =>
                setFilters({
                  name: "",
                  subject: ALL_VALUE,
                  teacher: "",
                  status: ALL_VALUE,
                })
              }
            >
              Reset Filters
            </Button>
          </div>

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
                  {filteredBatches.length > 0 ? (
                    filteredBatches.map((batch) => (
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
                        {batches.length === 0
                          ? "No batches found"
                          : "No batches match the filters"}
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
    </div>
  );
}
