import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedVideoProvider, setSelectedVideoProvider] = useState("manual");
  const [selectedPrivacy, setSelectedPrivacy] = useState("");
  const [selectedReminderTime, setSelectedReminderTime] = useState("0");
  const [videoLink, setVideoLink] = useState("");

  const isEditMode = Boolean(editingClass);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm();

  const tutors = tutorsData?.tutors || [];
  const subjects = subjectsData?.subjects || [];
  const batches = batchesData?.batches || [];

  const syncTeacherFromBatch = (batchId) => {
    const selectedBatch = batches.find((batch) => batch._id === batchId);
    if (!selectedBatch?.teacherId?._id) return;
    const teacherId = selectedBatch.teacherId._id;
    setSelectedTeacherId(teacherId);
    setValue("teacherId", teacherId, { shouldValidate: true });
  };

  const handleGenerateMeeting = async () => {
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
        setVideoLink(res.meetLink || "");
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
    setSelectedSubjectId("");
    setSelectedBatchId("");
    setSelectedTeacherId("");
    setSelectedVideoProvider("manual");
    setSelectedPrivacy("");
    setSelectedReminderTime("0");
    setVideoLink("");
    reset();
  };

  const onSubmit = async (data) => {
    if (!selectedSubjectId || !selectedBatchId || !selectedTeacherId) {
      toast.error("Please select subject and batch");
      return;
    }

    const payload = {
      topic: data.topic,
      subjectId: selectedSubjectId,
      batchId: selectedBatchId,
      teacherId: selectedTeacherId,
      date: data.date,
      startTime: data.startTime,
      duration: Number(data.duration),
      videoProvider: selectedVideoProvider,
      videoLink,
      privacy: selectedPrivacy || undefined,
      reminderTime: Number(selectedReminderTime),
    };

    if (isEditMode) {
      payload.status = editingClass.status;
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
    setEditingClass(cls);
    setValue("topic", cls.topic || "");
    setValue("date", cls.date || "");
    setValue("startTime", cls.startTime || "");
    setValue("duration", cls.duration || 60);

    setSelectedSubjectId(cls.subjectId?._id || "");
    setSelectedBatchId(cls.batchId?._id || "");
    setSelectedTeacherId(cls.teacherId?._id || "");
    setSelectedVideoProvider(cls.videoProvider || "manual");
    setSelectedPrivacy(cls.privacy || "");
    setSelectedReminderTime(String(cls.reminderTime ?? 0));
    setVideoLink(cls.videoLink || "");
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

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">
          Manage Classes
        </h1>
      </div>

      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <ClassForm
            onSubmit={onSubmit}
            register={register}
            handleSubmit={handleSubmit}
            errors={errors}
            tutors={tutors}
            subjects={subjects}
            batches={batches}
            selectedSubjectId={selectedSubjectId}
            setSelectedSubjectId={setSelectedSubjectId}
            selectedBatchId={selectedBatchId}
            setSelectedBatchId={setSelectedBatchId}
            selectedTeacherId={selectedTeacherId}
            setSelectedTeacherId={setSelectedTeacherId}
            selectedVideoProvider={selectedVideoProvider}
            setSelectedVideoProvider={setSelectedVideoProvider}
            selectedPrivacy={selectedPrivacy}
            setSelectedPrivacy={setSelectedPrivacy}
            selectedReminderTime={selectedReminderTime}
            setSelectedReminderTime={setSelectedReminderTime}
            videoLink={videoLink}
            setVideoLink={setVideoLink}
            isEditMode={isEditMode}
            isCreating={isCreating}
            isUpdating={isUpdating}
            syncTeacherFromBatch={syncTeacherFromBatch}
            handleGenerateMeet={handleGenerateMeeting}
            isGeneratingMeet={isGeneratingMeet}
            resetFormState={resetFormState}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">All Classes</h2>

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
                  {classes.length > 0 ? (
                    classes.map((cls) => (
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
                              {cls.videoLink && cls.status !== "completed" && (
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
                        No classes found
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
