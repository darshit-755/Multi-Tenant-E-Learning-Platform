import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetMyClasses } from "@/hooks/tutor/useGetMyClasses";
import { Button } from "@/components/ui/button";
import Loader from "@/components/common/Loader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateWithDay } from "@/utils/classUtils";

const TutorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: classesData, isLoading } = useGetMyClasses();
  const classes = classesData?.classes || [];

  const [selectedDate, setSelectedDate] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [nowTs, setNowTs] = useState(() => Date.now());

  useEffect(() => {
    const timerId = setInterval(() => setNowTs(Date.now()), 30 * 1000);
    return () => clearInterval(timerId);
  }, []);

  // Normalize date (remove time)
  const normalizeDate = (date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

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

  const canShowJoinButton = (cls) => {
    if (!cls?.videoLink) return false;

    const status = normalizeStatus(cls.status);
    if (status === "cancelled" || status === "completed") return false;

    const cutoffTime = getJoinCutoffTime(cls);
    if (!cutoffTime) return true;

    return nowTs <= cutoffTime.getTime();
  };

  const today = normalizeDate(new Date());

  // Format selected date
  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString("en-CA")
    : null;

  // Classes for selected date
  const classesForDate = classes.filter((cls) => cls.date === formattedDate);

  // Get all class dates
  const classDates = classes.map((cls) =>
    cls.date ? new Date(cls.date) : null,
  );

  // Upcoming classes only + sorted
  const upcomingClasses = classes
    .filter((cls) => {
      if (!cls.date) return false;
      const classDate = normalizeDate(new Date(cls.date));
      return classDate >= today;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Selected day check
  const selectedDay = selectedDate ? normalizeDate(selectedDate) : null;

  const isSelectedDate = (date) => {
    if (!selectedDay) return false;
    return normalizeDate(date).getTime() === selectedDay.getTime();
  };

  if (isLoading) return <Loader />;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold capitalize">Welcome, {user?.name}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>

          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              onSelect={(date) => {
                if (!date) return;
                setSelectedDate(date);
                setOpenDialog(true);
              }}
              modifiers={{
                todayDefault: (date) =>
                  normalizeDate(date).getTime() === today.getTime(),

                hasFutureClass: (date) =>
                  classDates.some(
                    (d) =>
                      d &&
                      normalizeDate(d).getTime() ===
                        normalizeDate(date).getTime() &&
                      normalizeDate(d) > today,
                  ),

                selectedPast: (date) =>
                  isSelectedDate(date) && normalizeDate(date) < today,
              }}
              modifiersClassNames={{
                todayDefault:
                  "bg-green-600 text-white rounded-md hover:bg-green-700",

                hasFutureClass:
                  "bg-yellow-300 text-yellow-950 rounded-md hover:bg-yellow-400",

                selectedPast:
                  "bg-zinc-200 text-zinc-700 rounded-md hover:bg-zinc-300",
              }}
            />
          </CardContent>
        </Card>

        {/* Upcoming Classes Table */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Classes</CardTitle>
          </CardHeader>

          <CardContent>
            {upcomingClasses.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Topic</TableHead>
                      <TableHead>Subject</TableHead>

                      <TableHead>Schedule</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {upcomingClasses.map((cls) => (
                      <TableRow
                        key={cls._id}
                        className="cursor-pointer hover:bg-slate-100"
                        onClick={() => navigate("/tutor/my-classes")}
                      >
                        <TableCell className="font-medium">
                          {cls.topic || "Class Session"}
                        </TableCell>
                        <TableCell>{cls.subjectId?.name || "-"}</TableCell>

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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No upcoming classes
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog for selected date */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Classes on {formatDateWithDay(formattedDate)}
            </DialogTitle>
          </DialogHeader>

          {classesForDate.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Topic</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {classesForDate.map((cls) => {
                    const normalizedStatus = normalizeStatus(cls.status);
                    const isCompleted = normalizedStatus === "completed";
                    const isCancelled = normalizedStatus === "cancelled";
                    const canJoin = canShowJoinButton(cls);

                    return (
                    <TableRow
                      key={cls._id}
                      className="cursor-pointer hover:bg-slate-100"
                    >
                      <TableCell className="font-medium">
                        {cls.topic || "Class Session"}
                      </TableCell>
                      <TableCell>{cls.subjectId?.name || "-"}</TableCell>
                      <TableCell>{cls.batchId?.name || "-"}</TableCell>
                      <TableCell className="text-sm">
                        {cls.batchId?.studentIds?.length || 0} students
                      </TableCell>
                      <TableCell>
                        {cls.startTime
                          ? `${cls.startTime} (${cls.duration || 0} min)`
                          : "-"}
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
                      <TableCell>
                        {canJoin ? (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => window.open(cls.videoLink, "_blank")}
                          >
                            Join
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {isCompleted
                              ? "Class completed"
                              : "-"}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-6">
              No classes scheduled for this date
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TutorDashboard;
