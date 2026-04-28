import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ClassForm({
  onSubmit,
  register,
  handleSubmit,
  watch,
  setValue,
  errors,
  tutors,
  subjects,
  batches,
  isEditMode,
  editingClass,
  isCreating,
  isUpdating,
  syncTeacherFromBatch,
  handleGenerateMeet,
  isGeneratingMeet,
  resetFormState,
}) {
  const selectedSubjectId = watch("subjectId") || "";
  const selectedBatchId = watch("batchId") || "";
  const selectedTeacherId = watch("teacherId") || "";
  const selectedVideoProvider = watch("videoProvider") || "manual";
  const selectedPrivacy = watch("privacy") || "";
  const selectedReminderTime = watch("reminderTime") || "0";
  const videoLink = watch("videoLink") || "";
  
  const activeSubjects = subjects.filter((s) => s.status === "active");
  const availableSubjects = isEditMode ? subjects : activeSubjects;

  const filteredBatches = batches.filter((batch) => {
    // In edit mode, keep the currently selected batch even if inactive
    if (isEditMode && batch._id === selectedBatchId) return true;
    if (batch.status !== "active") return false;
    if (!selectedSubjectId) return true;
    return batch.subjectId?._id === selectedSubjectId;
  });

  const handleVideoProviderChange = (provider) => {
    setValue("videoProvider", provider, { shouldValidate: true, shouldDirty: true });
    // Keep generated links for Google Meet / Zoom, clear for other providers.
    if (!["gmeet", "zoom"].includes(provider)) {
      setValue("videoLink", "", { shouldValidate: true, shouldDirty: true });
    }
  };

  const supportsAutoGeneration = ["gmeet", "zoom"].includes(selectedVideoProvider);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* Topic */}
      <div>
        <Label>Topic</Label>
        <Input
          placeholder="e.g. Algebra fundamentals"
          className="mt-1"
          {...register("topic")}
        />
      </div>

      {/* Subject */}
      <div>
        <Label>Subject</Label>
        <input
          type="hidden"
          {...register("subjectId", { required: "Subject is required" })}
        />
        <Select
          key={`class-subject-${editingClass?._id || "new"}`}
          value={selectedSubjectId}
          onValueChange={(value) => {
            setValue("subjectId", value, { shouldValidate: true, shouldDirty: true });
            setValue("batchId", "", { shouldValidate: true, shouldDirty: true });
            setValue("teacherId", "", { shouldValidate: true, shouldDirty: true });
          }}
        >
          <SelectTrigger className="mt-1 w-full">
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            {availableSubjects.length > 0 ? (
              availableSubjects.map((subject) => (
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
        {errors.subjectId && <p className="text-red-500 text-xs">{errors.subjectId.message}</p>}
      </div>

      {/* Batch */}
      <div>
        <Label>Batch</Label>
        <input
          type="hidden"
          {...register("batchId", { required: "Batch is required" })}
        />
        <Select
          key={`class-batch-${editingClass?._id || "new"}-${selectedSubjectId}`}
          value={selectedBatchId}
          onValueChange={(value) => {
            setValue("batchId", value, { shouldValidate: true, shouldDirty: true });
            syncTeacherFromBatch(value);
          }}
        >
          <SelectTrigger className="mt-1 w-full">
            <SelectValue placeholder="Select batch" />
          </SelectTrigger>
          <SelectContent>
            {filteredBatches.length > 0 ? (
              filteredBatches.map((batch) => (
                <SelectItem key={batch._id} value={batch._id}>
                  {batch.name}
                </SelectItem>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                {selectedSubjectId
                  ? "No batch available for this subject. Create a batch first."
                  : "Select a subject first"}
              </div>
            )}
          </SelectContent>
        </Select>
        {errors.batchId && <p className="text-red-500 text-xs">{errors.batchId.message}</p>}
      </div>

      {/* Teacher */}
      <div>
        <Label>Teacher</Label>
        <input type="hidden" {...register("teacherId")} />
        <Input
          className="mt-1"
          readOnly
          value={
            tutors.find(
              (t) =>
                t.tutorId === selectedTeacherId ||
                t._id === selectedTeacherId,
            )?.name || "Auto-selected from batch"
          }
        />
      </div>

      {/* Date, Time, Duration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Date</Label>
          <Input
            type="date"
            {...register("date", { required: "Date is required" })}
          />
          {errors.date && <p className="text-red-500 text-xs">{errors.date.message}</p>}
        </div>

        <div>
          <Label>Start Time</Label>
          <Input
            type="time"
            {...register("startTime", { required: "Start time is required" })}
          />
          {errors.startTime && <p className="text-red-500 text-xs">{errors.startTime.message}</p>}
        </div>

        <div>
          <Label>Duration ( Minutes )</Label>
          <Input
            type="number"
            {...register("duration", { required: "Duration is required" })}
          />
        </div>
      </div>

      {/* Video Provider */}
      <div>
        <Label>Video Provider</Label>
        <input type="hidden" {...register("videoProvider")} />
        <Select key={`class-provider-${editingClass?._id || "new"}`} value={selectedVideoProvider} onValueChange={handleVideoProviderChange}>
          <SelectTrigger className="mt-1 w-full">
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="gmeet">Google Meet</SelectItem>
            <SelectItem value="zoom">Zoom</SelectItem>
            <SelectItem value="youtube">YouTube</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Auto-generated meeting link */}
      {supportsAutoGeneration && (
        <Button type="button" onClick={handleGenerateMeet} disabled={isGeneratingMeet}>
          {isGeneratingMeet
            ? "Generating..."
            : selectedVideoProvider === "zoom"
              ? "Generate Zoom"
              : "Generate Meet"}
        </Button>
      )}

      {/* Link - Display generated link */}
      {supportsAutoGeneration && videoLink && (
        <div>
          <Label>Link</Label>
          <Input
            type="text"
            readOnly
            value={videoLink}
            className="mt-1 bg-gray-100 cursor-not-allowed"
          />
        </div>
      )}

      {/* Video Link */}
      {!supportsAutoGeneration && (<>
        <Label className='mb-2'>Video Link</Label>
        <Input
          placeholder="Paste video link"
          {...register("videoLink")}
        />
        </>
      )}

      {/* Privacy */}
     {selectedVideoProvider === "youtube" && (
              <div>
                <Label>Privacy</Label>
                <input type="hidden" {...register("privacy")} />
                <Select
                  value={selectedPrivacy || "public"}
                  onValueChange={(value) =>
                    setValue("privacy", value, { shouldValidate: true, shouldDirty: true })
                  }
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Select privacy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="unlisted">Unlisted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

      {/* Reminder */}
       <div>
              <Label>Reminder</Label>
              <input type="hidden" {...register("reminderTime")} />
              <Select
                value={selectedReminderTime}
                onValueChange={(value) =>
                  setValue("reminderTime", value, { shouldValidate: true, shouldDirty: true })
                }
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="Select reminder time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No reminder</SelectItem>
                  <SelectItem value="10">10 minutes before</SelectItem>
                  <SelectItem value="30">30 minutes before</SelectItem>
                  <SelectItem value="60">60 minutes before</SelectItem>
                </SelectContent>
              </Select>
            </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2">
        {isEditMode && (
          <Button type="button" variant="outline" onClick={resetFormState}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isCreating || isUpdating}>
          {isEditMode ? "Update Class" : "Create Class"}
        </Button>
      </div>
    </form>
  );
}