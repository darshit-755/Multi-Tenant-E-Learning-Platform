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
  errors,
  tutors,
  subjects,
  batches,
  selectedSubjectId,
  setSelectedSubjectId,
  selectedBatchId,
  setSelectedBatchId,
  selectedTeacherId,
  setSelectedTeacherId,
  selectedVideoProvider,
  setSelectedVideoProvider,
  selectedPrivacy,
  setSelectedPrivacy,
  selectedReminderTime,
  setSelectedReminderTime,
  videoLink,
  setVideoLink,
  isEditMode,
  isCreating,
  isUpdating,
  syncTeacherFromBatch,
  handleGenerateMeet,
  isGeneratingMeet,
  resetFormState,
}) {
  
  const activeSubjects = subjects.filter((s) => s.status === "active");

  const filteredBatches = batches.filter((batch) => {
    if (batch.status !== "active") return false;
    if (!selectedSubjectId) return true;
    return batch.subjectId?._id === selectedSubjectId;
  });

  const handleVideoProviderChange = (provider) => {
    setSelectedVideoProvider(provider);
    // Keep generated links for Google Meet / Zoom, clear for other providers.
    if (!["gmeet", "zoom"].includes(provider)) {
      setVideoLink("");
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
        <Select
          value={selectedSubjectId}
          onValueChange={(value) => {
            setSelectedSubjectId(value);
            setSelectedBatchId("");
            setSelectedTeacherId("");
          }}
        >
          <SelectTrigger className="mt-1 w-full">
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            {activeSubjects.map((subject) => (
              <SelectItem key={subject._id} value={subject._id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Batch */}
      <div>
        <Label>Batch</Label>
        <Select
          value={selectedBatchId}
          onValueChange={(value) => {
            setSelectedBatchId(value);
            syncTeacherFromBatch(value);
          }}
        >
          <SelectTrigger className="mt-1 w-full">
            <SelectValue placeholder="Select batch" />
          </SelectTrigger>
          <SelectContent>
            {filteredBatches.map((batch) => (
              <SelectItem key={batch._id} value={batch._id}>
                {batch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Teacher */}
      <div>
        <Label>Teacher</Label>
        <Input
          className="mt-1"
          readOnly
          value={
            tutors.find((t) => t.tutorId === selectedTeacherId)?.name ||
            "Auto-selected from batch"
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
          <Label>Duration</Label>
          <Input
            type="number"
            {...register("duration", { required: "Duration is required" })}
          />
        </div>
      </div>

      {/* Video Provider */}
      <div>
        <Label>Video Provider</Label>
        <Select value={selectedVideoProvider} onValueChange={handleVideoProviderChange}>
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
          value={videoLink}
          onChange={(e) => setVideoLink(e.target.value)}
        />
        </>
      )}

      {/* Privacy */}
     {selectedVideoProvider === "youtube" && (
              <div>
                <Label>Privacy</Label>
                <Select value={selectedPrivacy || "public"} onValueChange={setSelectedPrivacy}>
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
              <Select value={selectedReminderTime} onValueChange={setSelectedReminderTime}>
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