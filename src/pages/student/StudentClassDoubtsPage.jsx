import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  addClassDoubtMessageApi,
  getClassDoubtConversationApi,
  markDoubtSolvedApi,
} from "@/services/classDoubt.api";
import { toast } from "sonner";

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

export default function StudentClassDoubtsPage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const currentUserId = useMemo(() => getUserId(user), [user]);
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);

  const queryKey = useMemo(() => ["class-doubts", classId, "student"], [classId]);

  const {
    data: doubtData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await getClassDoubtConversationApi(classId);
      return data;
    },
    enabled: Boolean(classId),
  });

  const addMessageMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await addClassDoubtMessageApi(classId, payload);
      return data;
    },
    onSuccess: () => {
      setText("");
      setFiles([]);
      queryClient.invalidateQueries({ queryKey });
      toast.success("Message sent");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to send message");
    },
  });

  const markSolvedMutation = useMutation({
    mutationFn: async () => {
      const msgPayload = new FormData();
      msgPayload.append("text", "Doubt Solved");
      await addClassDoubtMessageApi(classId, msgPayload);
      const { data } = await markDoubtSolvedApi(classId);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Doubt marked as solved");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to mark doubt as solved");
    },
  });

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length > 5) {
      toast.error("You can upload up to 5 screenshots");
      setFiles(selectedFiles.slice(0, 5));
      return;
    }
    setFiles(selectedFiles);
  };

  const handleSendMessage = (event) => {
    event.preventDefault();
    const hasText = Boolean(text.trim());
    const hasFiles = files.length > 0;
    if (!hasText && !hasFiles) {
      toast.error("Type a message or attach screenshot(s)");
      return;
    }
    const payload = new FormData();
    payload.append("text", text.trim());
    Array.from(files).forEach((file) => payload.append("screenshots", file));
    addMessageMutation.mutate(payload);
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground p-4">Loading doubts...</p>;
  }

  if (isError) {
    return (
      <div className="p-4 space-y-3">
        <p className="text-sm text-red-600">{error?.response?.data?.message || "Failed to load doubts"}</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
      </div>
    );
  }

  const classInfo = doubtData?.classInfo;
  const messages = doubtData?.messages || [];
  const doubtStatus = doubtData?.doubtStatus || "pending";

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-800">Raise Doubt</h1>
        <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
      </div>

      <Card>
        <CardContent className="p-5 space-y-3">
          <h2 className="text-lg font-semibold text-slate-800">Class Details</h2>
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
                  <TableCell className="font-medium">{classInfo?.topic || "-"}</TableCell>
                  <TableCell>{classInfo?.subject || "-"}</TableCell>
                  <TableCell>{classInfo?.batch || "-"}</TableCell>
                  <TableCell>{classInfo?.tutor || "-"}</TableCell>
                  <TableCell>{classInfo?.date || "-"}</TableCell>
                  <TableCell>{classInfo?.startTime || "-"}</TableCell>
                  <TableCell>{classInfo?.duration || 0} min</TableCell>
                  <TableCell className="capitalize">{classInfo?.status || "-"}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Conversation</h2>
          <div className="max-h-96 overflow-y-auto space-y-3 border rounded-md p-3 bg-[#f0f2f5]">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No doubts yet. Start the conversation.</p>
            ) : (
              messages.map((msg) => {
                const side = getMessageSide(msg, currentUserId);
                return (
                  <div key={msg._id} className={`flex ${messageAlignBySide[side]}`}>
                    <div className={`w-full max-w-[85%] border rounded-2xl p-3 ${messageBubbleBySide[side]}`}>
                      <div className={`flex items-center justify-between gap-2 text-xs ${messageMetaBySide[side]}`}>
                        <p className="font-semibold">{getMessageLabel(msg, side)}</p>
                        <p className="shrink-0">{msg?.createdAt ? new Date(msg.createdAt).toLocaleString() : ""}</p>
                      </div>
                      {msg?.text ? <p className="text-sm mt-2 whitespace-pre-wrap">{msg.text}</p> : null}
                      {Array.isArray(msg?.screenshots) && msg.screenshots.length > 0 ? (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {msg.screenshots.map((imgUrl, idx) => (
                            <a key={`${msg._id}-${idx}`} href={imgUrl} target="_blank" rel="noreferrer" className="block">
                              <img src={imgUrl} alt="doubt screenshot" className="rounded border w-full h-40 object-cover" />
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

          <form onSubmit={handleSendMessage} className="space-y-3 border rounded-md p-4 bg-slate-50">
            <div className="space-y-2">
              <Label htmlFor="doubt-text">Message</Label>
              <textarea
                id="doubt-text"
                className="w-full min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Describe your doubt here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doubt-files">Screenshots (optional)</Label>
              <Input id="doubt-files" type="file" accept="image/png,image/jpeg,image/jpg" multiple onChange={handleFileChange} />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={addMessageMutation.isPending}>
                {addMessageMutation.isPending ? "Sending..." : "Convey Doubt"}
              </Button>
              {messages.length > 0 && doubtStatus !== "solved" && (
                <Button
                  type="button"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={markSolvedMutation.isPending}
                  onClick={() => markSolvedMutation.mutate()}
                >
                  {markSolvedMutation.isPending ? "Solving..." : "Doubt Solved"}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
