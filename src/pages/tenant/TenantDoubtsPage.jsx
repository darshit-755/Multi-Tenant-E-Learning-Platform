import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { getClassesApi } from "@/services/class.api";
import {
  getClassDoubtConversationApi,
  addClassDoubtMessageApi,
  markDoubtSolvedApi,
} from "@/services/classDoubt.api";
import { toast } from "sonner";

const normalizeStatus = (status) => String(status || "").trim().toLowerCase();

const getUserId = (user) => String(user?._id || user?.id || "");

const getMessageSenderId = (message) =>
  String(message?.senderUserId?._id || message?.senderUserId || "");

const getMessageSide = (message, currentUserId) => {
  const senderRole = message?.senderRole;
  if (senderRole === "tenant") return "center";
  if (currentUserId && getMessageSenderId(message) === currentUserId)
    return "self";
  return "other";
};

const messageAlignBySide = {
  self: "justify-end",
  other: "justify-start",
  center: "justify-center",
};

const messageBubbleBySide = {
  self: "bg-[#d9fdd3] text-slate-900 border-[#b8e2ac] shadow-sm",
  other: "bg-white text-slate-900 border-slate-200 shadow-sm",
  center: "bg-blue-50 text-blue-900 border-blue-200 shadow-sm",
};

const messageMetaBySide = {
  self: "text-slate-500",
  other: "text-slate-500",
  center: "text-blue-500",
};

const getMessageLabel = (message, side) => {
  if (side === "self") return "You";
  return message?.senderUserId?.name || message?.senderRole || "Unknown";
};

export default function TenantDoubtsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const currentUserId = useMemo(() => getUserId(user), [user]);

  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [viewingClassId, setViewingClassId] = useState(null);

  // Fetch all classes (which include batch and student data)
  const { data: classesData, isLoading: isClassesLoading } = useQuery({
    queryKey: ["tenant-classes"],
    queryFn: async () => {
      const { data } = await getClassesApi();
      return data;
    },
  });

  const allClasses = classesData?.classes || [];

  // Extract unique batches from classes
  const batches = useMemo(() => {
    const uniqueBatches = {};
    allClasses.forEach((cls) => {
      if (cls.batchId && !uniqueBatches[cls.batchId._id]) {
        uniqueBatches[cls.batchId._id] = cls.batchId;
      }
    });
    return Object.values(uniqueBatches);
  }, [allClasses]);

  // Get students from selected batch
  const studentsInBatch = useMemo(() => {
    if (!selectedBatchId) return [];
    const batch = batches.find((b) => String(b._id) === selectedBatchId);
    return batch?.studentIds || [];
  }, [batches, selectedBatchId]);

  // Filter classes by selected batch
  const classesForBatch = useMemo(() => {
    if (!selectedBatchId) return [];
    return allClasses.filter(
      (cls) => String(cls.batchId?._id || cls.batchId) === selectedBatchId
    );
  }, [allClasses, selectedBatchId]);

  // Final filtered classes (by class dropdown)
  const filteredClasses = useMemo(() => {
    if (!selectedClassId) return classesForBatch;
    return classesForBatch.filter(
      (cls) => String(cls._id) === selectedClassId
    );
  }, [classesForBatch, selectedClassId]);

  const conversationQueryKey = useMemo(
    () => ["tenant-class-doubts", viewingClassId, selectedStudentId],
    [viewingClassId, selectedStudentId]
  );

  const { data: doubtData, isLoading: isConversationLoading } = useQuery({
    queryKey: conversationQueryKey,
    queryFn: async () => {
      const { data } = await getClassDoubtConversationApi(viewingClassId, selectedStudentId);
      return data;
    },
    enabled: Boolean(viewingClassId) && Boolean(selectedStudentId),
  });

  const markSolvedMutation = useMutation({
    mutationFn: async () => {
      const msgPayload = new FormData();
      msgPayload.append("text", "Doubt Solved");
      await addClassDoubtMessageApi(viewingClassId, msgPayload, selectedStudentId);
      const { data } = await markDoubtSolvedApi(viewingClassId, selectedStudentId);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationQueryKey });
      toast.success("Doubt marked as solved");
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || "Failed to mark doubt as solved"
      );
    },
  });

  const messages = doubtData?.messages || [];
  const doubtStatus = doubtData?.doubtStatus || "pending";
  const classInfo = doubtData?.classInfo;

  const handleBatchChange = (e) => {
    setSelectedBatchId(e.target.value);
    setSelectedStudentId("");
    setSelectedClassId("");
    setViewingClassId(null);
  };

  const handleStudentChange = (e) => {
    setSelectedStudentId(e.target.value);
    setSelectedClassId("");
    setViewingClassId(null);
  };

  const handleClassChange = (e) => {
    setSelectedClassId(e.target.value);
    setViewingClassId(null);
  };

  // Conversation view
  if (viewingClassId) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-slate-800">
            Class Doubt Conversation
          </h1>
          <Button variant="outline" onClick={() => setViewingClassId(null)}>
            Back to Classes
          </Button>
        </div>

        {classInfo && (
          <Card>
            <CardContent className="p-5 space-y-3">
              <h2 className="text-lg font-semibold text-slate-800">
                Class Details
              </h2>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Topic</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Tutor</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">
                        {classInfo?.topic || "-"}
                      </TableCell>
                      <TableCell>{classInfo?.subject || "-"}</TableCell>
                      <TableCell>{classInfo?.batch || "-"}</TableCell>
                      <TableCell>{classInfo?.tutor || "-"}</TableCell>
                      <TableCell>{classInfo?.date || "-"}</TableCell>
                      <TableCell>{classInfo?.startTime || "-"}</TableCell>
                      <TableCell>{classInfo?.duration || 0} min</TableCell>
                      <TableCell className="capitalize">
                        {classInfo?.status || "-"}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-5 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">
              Conversation
            </h2>

            {isConversationLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading conversation...
              </p>
            ) : (
              <>
                <div className="max-h-96 overflow-y-auto space-y-3 border rounded-md p-3 bg-[#f0f2f5]">
                  {messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No doubts yet for this class.
                    </p>
                  ) : (
                    messages.map((msg) => {
                      const senderRole = msg?.senderRole || "student";
                      const side = getMessageSide(msg, currentUserId);
                      return (
                        <div
                          key={msg._id}
                          className={`flex ${messageAlignBySide[side]}`}
                        >
                          <div
                            className={`w-full max-w-[85%] border rounded-2xl p-3 ${messageBubbleBySide[side]}`}
                          >
                            <div
                              className={`flex items-center justify-between gap-2 text-xs ${messageMetaBySide[side]}`}
                            >
                              <p className="font-semibold">
                                {getMessageLabel(msg, side)}
                                {side !== "self"
                                  ? ` (${senderRole})`
                                  : ""}
                              </p>
                              <p className="shrink-0">
                                {msg?.createdAt
                                  ? new Date(msg.createdAt).toLocaleString()
                                  : ""}
                              </p>
                            </div>

                            {msg?.text ? (
                              <p className="text-sm mt-2 whitespace-pre-wrap">
                                {msg.text}
                              </p>
                            ) : null}

                            {Array.isArray(msg?.screenshots) &&
                            msg.screenshots.length > 0 ? (
                              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {msg.screenshots.map((imgUrl, idx) => (
                                  <a
                                    key={`${msg._id}-${idx}`}
                                    href={imgUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block"
                                  >
                                    <img
                                      src={imgUrl}
                                      alt="doubt screenshot"
                                      className="rounded border w-full h-40 object-cover"
                                    />
                                  </a>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {messages.length > 0 && doubtStatus !== "solved" && (
                  <div className="flex justify-end">
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={markSolvedMutation.isPending}
                      onClick={() => markSolvedMutation.mutate()}
                    >
                      {markSolvedMutation.isPending
                        ? "Solving..."
                        : "Doubt Solved"}
                    </Button>
                  </div>
                )}

                {doubtStatus === "solved" && (
                  <div className="flex justify-end">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-800">
                      ✓ Doubt Solved
                    </span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main view — sequential dropdowns + table
  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 p-2 sm:p-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-2xl font-bold text-slate-900">Doubts</h2>
        <p className="mt-1 text-sm text-slate-600">
          View and manage student doubts across batches and classes
        </p>
      </div>

      {/* Dropdowns Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 space-y-4">
        {/* Batch Selection */}
        <div>
          <label
            htmlFor="batch-select"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Select Batch:
          </label>
          <select
            id="batch-select"
            value={selectedBatchId}
            onChange={handleBatchChange}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:border-slate-500 focus:outline-none"
          >
            <option value="">-- Choose a batch --</option>
            {batches.map((batch) => (
              <option key={batch._id} value={batch._id}>
                {batch.name}
              </option>
            ))}
          </select>
        </div>

        {/* Student Selection — only after batch is selected */}
        {selectedBatchId && (
          <div>
            <label
              htmlFor="student-select"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Select Student:
            </label>
            <select
              id="student-select"
              value={selectedStudentId}
              onChange={handleStudentChange}
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:border-slate-500 focus:outline-none"
            >
              <option value="">-- All students --</option>
              {studentsInBatch.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.userId?.name || student.userId?.email || "Unknown"}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Class Selection — only after batch is selected */}
        {selectedBatchId && (
          <div>
            <label
              htmlFor="class-select"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Select Class:
            </label>
            <select
              id="class-select"
              value={selectedClassId}
              onChange={handleClassChange}
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:border-slate-500 focus:outline-none"
            >
              <option value="">-- All classes --</option>
              {classesForBatch.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.topic || "Class Session"} — {cls.subjectId?.name || ""}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Classes Table — only after batch is selected */}
      {selectedBatchId && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Topic</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Class Status</TableHead>
                  {selectedStudentId && <TableHead>Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.length > 0 ? (
                  filteredClasses.map((cls) => {
                    const status = normalizeStatus(cls.status);
                    const isCompleted = status === "completed";
                    const isCancelled = status === "cancelled";

                    return (
                      <TableRow key={cls._id}>
                        <TableCell className="font-medium">
                          {cls.topic || "Class Session"}
                        </TableCell>
                        <TableCell>{cls.subjectId?.name || "-"}</TableCell>
                        <TableCell>{cls.batchId?.name || "-"}</TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <div>{cls.date || "-"}</div>
                            <div className="text-muted-foreground">
                              {cls.startTime
                                ? `${cls.startTime} (${cls.duration || 0} min)`
                                : "-"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-3 py-1 text-xs rounded-full font-medium ${
                              isCompleted
                                ? "bg-blue-100 text-blue-800"
                                : isCancelled
                                  ? "bg-red-100 text-red-700"
                                  : "bg-green-100 text-green-800"
                            }`}
                          >
                            {isCompleted
                              ? "Completed"
                              : isCancelled
                                ? "Cancelled"
                                : "Scheduled"}
                          </span>
                        </TableCell>
                        {selectedStudentId && (
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setViewingClassId(cls._id)}
                            >
                              View Doubt
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={selectedStudentId ? 6 : 5}
                      className="text-center text-sm text-muted-foreground py-8"
                    >
                      No classes found for the selected batch
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {isClassesLoading && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center text-sm font-medium text-slate-600">
          Loading classes...
        </div>
      )}
    </div>
  );
}
