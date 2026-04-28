import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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

import ConfirmActionDialog from "@/components/common/ConfirmActionDialog";

import { useClassManager } from "@/hooks/tenant/useClassManager";

import { useGetTutors } from "@/hooks/tenant/useGetTutors";
import { useGetSubjects } from "@/hooks/tenant/useGetSubjects";
import { useGetBatches } from "@/hooks/tenant/useGetBatches";

import { useCreateMeet } from "@/hooks/tenant/useCreateMeet";

import ClassForm from "@/components/tenant/ClassForm";

import { formatDateWithDay } from "@/utils/classUtils";
import { toast } from "sonner";

export default function ManageClasses() {
  const location = useLocation();
  const navigate = useNavigate();
  const { classId } = useParams();
  const isAddPage = location.pathname === "/tenant/classes/add";
  const isViewPage = location.pathname === "/tenant/classes/view";
  const isEditPage = Boolean(classId);
  const {
    classes,
    isLoading,
    createClass,
    updateClass,
    deleteClass,
    isCreating,
    isUpdating,
    isDeleting,
  } = useClassManager();

  const { data: tutorsData } = useGetTutors();
  const { data: subjectsData } = useGetSubjects();
  const { data: batchesData } = useGetBatches();

  const { mutateAsync: createMeet, isPending: isGeneratingMeet } =
    useCreateMeet();

  const [editingClass, setEditingClass] = useState(null);
  const [deleteClassId, setDeleteClassId] = useState(null);
  const [nowTs, setNowTs] = useState(() => Date.now());
  const ALL_VALUE = "__all";
  const [filters, setFilters] = useState({
    topic: "",
    subject: ALL_VALUE,
    teacher: "",
    batch: "",
    status: ALL_VALUE,
  });

  useEffect(() => {
    const timerId = setInterval(() => setNowTs(Date.now()), 30 * 1000);
    return () => clearInterval(timerId);
  }, []);

  const isEditMode = Boolean(editingClass);

  const defaultFormValues = {
    topic: "",
    subjectId: "",
    batchId: "",
    teacherId: "",
    date: "",
    startTime: "",
    duration: 60,
    videoProvider: "manual",
    privacy: "",
    reminderTime: "0",
    videoLink: "",
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: defaultFormValues });

  const tutors = tutorsData?.tutors || [];
  const subjects = subjectsData?.subjects || [];
  const batches = batchesData?.batches || [];

  const normalizeStatus = (status) => String(status || "").trim().toLowerCase();

  const parseClassStartDateTime = (cls) => {
    if (!cls?.date || !cls?.startTime) return null;

    const datePart = String(cls.date).split("T")[0];
    const baseDate = new Date(`${datePart}T00:00:00`);
    if (Number.isNaN(baseDate.getTime())) return null;

    const timeMatch = String(cls.startTime)
      .trim()
      .match(/^(\d{1,2}):(\d{2})(?:\s*([AaPp][Mm]))?$/);
    if (!timeMatch) return null;

    let hours = Number(timeMatch[1]);
    const minutes = Number(timeMatch[2]);
    const meridiem = timeMatch[3]?.toUpperCase();

    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;

    if (meridiem) {
      if (hours === 12) hours = 0;
      if (meridiem === "PM") hours += 12;
    }

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

    const startDateTime = new Date(baseDate);
    startDateTime.setHours(hours, minutes, 0, 0);
    return startDateTime;
  };

  const getJoinCutoffTime = (cls) => {
    const startDateTime = parseClassStartDateTime(cls);
    if (!startDateTime) return null;

    const duration = Number(cls.duration);
    const durationMinutes = Number.isFinite(duration) && duration > 0 ? duration : 0;
    const graceMinutes = 15;
    return new Date(startDateTime.getTime() + (durationMinutes + graceMinutes) * 60 * 1000);
  };

  const canShowOpenLink = (cls) => {
    if (!cls?.videoLink) return false;

    const status = normalizeStatus(cls.status);
    if (status === "cancelled" || status === "completed") return false;

    const cutoffTime = getJoinCutoffTime(cls);
    if (!cutoffTime) return true;

    return nowTs <= cutoffTime.getTime();
  };

  const syncTeacherFromBatch = (batchId) => {
    const selectedBatch = batches.find((batch) => batch._id === batchId);
    if (!selectedBatch?.teacherId?._id) return;
    const teacherId = selectedBatch.teacherId._id;
    setValue("teacherId", teacherId, { shouldValidate: true });
  };

  const handleGenerateMeeting = async () => {
    const selectedVideoProvider = getValues("videoProvider");

    if (!["gmeet", "zoom"].includes(selectedVideoProvider)) {
      toast.error("Please select Google Meet or Zoom first");
      return;
    }

    const date = getValues("date");
    const startTime = getValues("startTime");
    const duration = Number(getValues("duration") || 0);
    const topic = getValues("topic");

    if (!date || !startTime || duration <= 0) {
      toast.error("Select date, start time and duration first");
      return;
    }

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const endDateTime = new Date(`${date}T${startTime}:00`);
    endDateTime.setMinutes(endDateTime.getMinutes() + duration);

    const endHour = String(endDateTime.getHours()).padStart(2, "0");
    const endMinute = String(endDateTime.getMinutes()).padStart(2, "0");
    const endTime = `${endHour}:${endMinute}`;

    try {
      const res = await createMeet({
        date,
        startTime: `${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}`,
        endTime,
        provider: selectedVideoProvider,
        topic,
      });

      if (res?.success) {
        setValue("videoLink", res.meetLink || "", {
          shouldValidate: true,
          shouldDirty: true,
        });
        toast.success(
          selectedVideoProvider === "zoom"
            ? "Zoom link generated!"
            : "Google Meet link generated!"
        );
      } else {
        toast.error("Failed to generate meeting link");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const resetFormState = () => {
    setEditingClass(null);
    reset(defaultFormValues);
    if (isEditPage) {
      navigate("/tenant/classes/view");
    }
  };

  const onSubmit = async (data) => {
    if (!data.subjectId || !data.batchId || !data.teacherId) {
      toast.error("Please select subject and batch");
      return;
    }

    const payload = {
      topic: data.topic,
      subjectId: data.subjectId,
      batchId: data.batchId,
      teacherId: data.teacherId,
      date: data.date,
      startTime: data.startTime,
      duration: Number(data.duration),
      videoProvider: data.videoProvider,
      videoLink: data.videoLink,
      privacy: data.privacy || undefined,
      reminderTime: Number(data.reminderTime ?? 0),
    };

    if (isEditMode) {
      payload.status = "scheduled";
      const res = await updateClass({
        classId: editingClass._id,
        data: payload,
      });
      if (res) {
        toast.success("Class updated successfully!");
        resetFormState();
      }
      return;
    }

    const res = await createClass(payload);
    if (res) {
      toast.success("Class created successfully!");
      resetFormState();
    }
  };

  const handleEdit = (cls) => {
    navigate(`/tenant/classes/edit/${cls._id}`);
  };

  const handleStatusChange = async (cls, newStatus) => {
    const res = await updateClass({
      classId: cls._id,
      data: { status: newStatus },
    });

    if (res) {
      toast.success(`Class marked as ${newStatus}!`);
    }
  };

  const handleDelete = (id) => {
    setDeleteClassId(id);
  };

  const confirmDelete = () => {
    if (!deleteClassId) return;

    deleteClass(deleteClassId, {
      onSuccess: () => {
        toast.success("Class deleted successfully!");
        setDeleteClassId(null);
      },
    });
  };

  useEffect(() => {
    if (!isEditPage || !classes.length || !subjects.length || !batches.length || !tutors.length) return;
    const cls = classes.find((item) => item._id === classId);
    if (!cls) return;

    setEditingClass(cls);
    reset({
      ...defaultFormValues,
      topic: cls.topic || "",
      subjectId: cls.subjectId?._id || "",
      batchId: cls.batchId?._id || "",
      teacherId: cls.teacherId?._id || "",
      date: cls.date || "",
      startTime: cls.startTime || "",
      duration: cls.duration || 60,
      videoProvider: cls.videoProvider || "manual",
      privacy: cls.privacy || "",
      reminderTime: String(cls.reminderTime ?? 0),
      videoLink: cls.videoLink || "",
    });
  }, [isEditPage, classes, classId, subjects, batches, tutors, reset]);

  const uniqueSubjects = [
    ...new Set(classes.map((cls) => cls.subjectId?.name).filter(Boolean)),
  ];
  const filteredClasses = classes.filter((cls) => {
    const topicMatch =
      !filters.topic ||
      String(cls.topic || "").toLowerCase().includes(filters.topic.toLowerCase());
    const subjectMatch =
      filters.subject === ALL_VALUE ||
      String(cls.subjectId?.name || "") === filters.subject;
    const teacherMatch =
      !filters.teacher ||
      String(cls.teacherId?.userId?.name || "")
        .toLowerCase()
        .includes(filters.teacher.toLowerCase());
    const batchMatch =
      !filters.batch ||
      String(cls.batchId?.name || "").toLowerCase().includes(filters.batch.toLowerCase());
    const statusMatch =
      filters.status === ALL_VALUE || String(cls.status || "") === filters.status;
    return topicMatch && subjectMatch && teacherMatch && batchMatch && statusMatch;
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">
          {isViewPage ? "All Classes" : isEditPage ? "Edit Class" : "Add Class"}
        </h1>
      </div>

      {!isViewPage && (
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <ClassForm
            onSubmit={onSubmit}
            register={register}
            handleSubmit={handleSubmit}
            watch={watch}
            setValue={setValue}
            errors={errors}
            tutors={tutors}
            subjects={subjects}
            batches={batches}
            isEditMode={isEditMode}
            editingClass={editingClass}
            isCreating={isCreating}
            isUpdating={isUpdating}
            syncTeacherFromBatch={syncTeacherFromBatch}
            handleGenerateMeet={handleGenerateMeeting}
            isGeneratingMeet={isGeneratingMeet}
            resetFormState={resetFormState}
          />
        </CardContent>
      </Card>
      )}

      {isViewPage && (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">All Classes</h2>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
            <Input
              placeholder="Filter by topic"
              value={filters.topic}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, topic: e.target.value }))
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
            <Input
              placeholder="Filter by batch"
              value={filters.batch}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, batch: e.target.value }))
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
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() =>
                setFilters({
                  topic: "",
                  subject: ALL_VALUE,
                  teacher: "",
                  batch: "",
                  status: ALL_VALUE,
                })
              }
            >
              Reset
            </Button>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading classes...</p>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Topic</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Toggle Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredClasses.length > 0 ? (
                    filteredClasses.map((cls) => (
                      <TableRow key={cls._id}>
                        <TableCell>{cls.topic || "Class Session"}</TableCell>
                        <TableCell>{cls.subjectId?.name || "-"}</TableCell>
                        <TableCell>{cls.batchId?.name || "-"}</TableCell>
                        <TableCell>
                          {cls.teacherId?.userId?.name || "-"}
                        </TableCell>
                        <TableCell>{formatDateWithDay(cls.date)}</TableCell>
                        <TableCell>{cls.startTime || "-"}</TableCell>
                        <TableCell>
                          {cls.duration ? `${cls.duration} min` : "-"}
                        </TableCell>
                        <TableCell>{cls.videoProvider || "manual"}</TableCell>
                        <TableCell>
                          <span
                            className={`px-3 py-1 text-xs rounded-full font-medium ${
                              cls.status === "completed"
                                ? "bg-blue-100 text-blue-800"
                                : cls.status === "cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-green-100 text-green-800"
                            }`}
                          >
                            {cls.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant={
                                  cls.status === "completed"
                                    ? "secondary"
                                    : cls.status === "cancelled"
                                      ? "destructive"
                                      : "default"
                                }
                                disabled={isUpdating}
                                className="text-xs"
                              >
                                {cls.status}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(cls, "scheduled")
                                }
                              >
                                Scheduled
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(cls, "completed")
                                }
                              >
                                Completed
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(cls, "cancelled")
                                }
                              >
                                Cancelled
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(cls)}>
                                Edit
                              </DropdownMenuItem>
                              {canShowOpenLink(cls) && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    window.open(cls.videoLink, "_blank")
                                  }
                                >
                                  Open Link
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDelete(cls._id)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center text-sm">
                        {classes.length === 0
                          ? "No classes found"
                          : "No classes match the filters"}
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
        open={Boolean(deleteClassId)}
        onOpenChange={(open) => {
          if (!open) setDeleteClassId(null);
        }}
        title="Delete class?"
        description="This will permanently remove the class."
        confirmText="Delete"
        onConfirm={confirmDelete}
        isConfirming={isDeleting}
      />
    </div>
  );
}
