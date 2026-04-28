import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGetClasses } from "@/hooks/tenant/useGetClasses";
import { useGetTutors } from "@/hooks/tenant/useGetTutors";
import { useGetSubjects } from "@/hooks/tenant/useGetSubjects";
import { useGetBatches } from "@/hooks/tenant/useGetBatches";
import { useNavigate } from "react-router-dom";

import { Calendar } from "@/components/ui/calendar";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookMarked, GraduationCap, Users } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { formatDateWithDay } from "@/utils/classUtils";

const onboardingSteps = [
  {
    key: "subject",
    icon: BookMarked,
    title: "Add Subject",
    desc: "Start by adding the subjects your center offers.",
    route: "/tenant/add-subject",
    gradient: "from-violet-500 to-indigo-600",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
  },
  {
    key: "tutor",
    icon: GraduationCap,
    title: "Add Tutor",
    desc: "Register your tutors so you can assign them to batches.",
    route: "/tenant/tutors/add",
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  {
    key: "batch",
    icon: Users,
    title: "Create Batch",
    desc: "Group students by subject & tutor to organize classes.",
    route: "/tenant/batches/add",
    gradient: "from-amber-500 to-orange-600",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
];

const TenantDashboard = () => {
  const { user } = useAuth();
  const { data: classesData } = useGetClasses();
  const { data: tutorsData, isLoading: isTutorsLoading } = useGetTutors();
  const navigate = useNavigate();

  const classes = classesData?.classes || [];
  const latestTutors = [...(tutorsData?.tutors || [])]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const [selectedDate, setSelectedDate] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { data: subjectsData } = useGetSubjects();
  const { data: batchesData } = useGetBatches();

  const subjectCount = (subjectsData?.subjects || []).length;
  const batchCount = (batchesData?.batches || []).length;

  const tutorCount = (tutorsData?.tutors || []).length;

  // Show onboarding steps based on actual data
  const remainingSteps = onboardingSteps.filter((step) => {
    if (step.key === "subject") return subjectCount === 0;
    if (step.key === "tutor") return tutorCount === 0;
    if (step.key === "batch") return batchCount === 0;
    return false;
  });

  // Normalize date (remove time)
  const normalizeDate = (date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const normalizeStatus = (status) => String(status || "").trim().toLowerCase();
  const isClosedStatus = (status) => {
    const normalized = normalizeStatus(status);
    return (
      normalized === "completed" ||
      normalized === "complete" ||
      normalized === "cancelled" ||
      normalized === "canceled"
    );
  };

  const today = normalizeDate(new Date());

  // Format selected date
  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString("en-CA")
    : null;

  // Classes for selected date
  const classesForDate = classes.filter(
    (cls) => cls.date === formattedDate,
  );

  // Get all class dates
  const classDates = classes.map((cls) =>
    cls.date ? new Date(cls.date) : null,
  );

  // Upcoming classes only + sorted
  const upcomingClasses = classes
    .filter((cls) => {
      if (!cls.date) return false;
      const classDate = normalizeDate(new Date(cls.date));
      return classDate >= today && !isClosedStatus(cls.status);
    })
    .sort(
      (a, b) =>
        new Date(a.date) - new Date(b.date),
    );
  const filteredUpcomingClasses = upcomingClasses;
 

  // Selected day check
  const selectedDay = selectedDate ? normalizeDate(selectedDate) : null;

  const isSelectedDate = (date) => {
    if (!selectedDay) return false;
    return normalizeDate(date).getTime() === selectedDay.getTime();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold capitalize">
        Welcome, {user?.name}
      </h1>

      {/* Onboarding guide cards — based on actual data */}
      {remainingSteps.length > 0 && (
        <div>
          <p className="text-sm text-muted-foreground mb-3">
            🚀 Get started — {remainingSteps.length} step{remainingSteps.length > 1 ? "s" : ""} remaining:
          </p>
          <div className={`grid grid-cols-1 ${remainingSteps.length === 1 ? "sm:grid-cols-1 max-w-sm" : remainingSteps.length === 2 ? "sm:grid-cols-2 max-w-2xl" : "sm:grid-cols-3"} gap-3`}>
            {remainingSteps.map((step) => {
              const Icon = step.icon;
              return (
                <button
                  key={step.key}
                  onClick={() => navigate(step.route)}
                  className={`flex items-start gap-3 p-4 rounded-xl border ${step.border} ${step.bg} text-left hover:shadow-md transition-all cursor-pointer group`}
                >
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${step.gradient} flex items-center justify-center shrink-0 shadow`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

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
                  isSelectedDate(date) &&
                  normalizeDate(date) < today,
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
            {filteredUpcomingClasses.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Schedule</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredUpcomingClasses.map((cls) => (
                      <TableRow key={cls._id}>
                        <TableCell className="capitalize">
                          {cls.topic || "Class Session"}
                        </TableCell>

                        <TableCell className="capitalize">
                          {cls.subjectId?.name || "-"}
                        </TableCell>

                        <TableCell>
                          <div className="text-xs">
                            <div className="font-medium">
                              {formatDateWithDay(
                                cls.date,
                              )}
                            </div>

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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tutors</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/tenant/tutors/view")}
          >
            View All
          </Button>
        </CardHeader>

        <CardContent>
          {isTutorsLoading ? (
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
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {latestTutors.length > 0 ? (
                    latestTutors.map((tutor) => (
                      <TableRow key={tutor._id}>
                        <TableCell>{tutor.name}</TableCell>
                        <TableCell>{tutor.email}</TableCell>
                        <TableCell>{tutor.subjects?.join(", ") || "-"}</TableCell>
                        <TableCell>{tutor.experienceYears ?? "-"}</TableCell>
                        <TableCell>{tutor.phone || "-"}</TableCell>
                        <TableCell>
                          <span
                            className={`px-3 py-1 text-xs rounded-full font-medium ${
                              tutor.status === "inactive"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {tutor.status === "inactive" ? "Inactive" : "Active"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {tutor.createdAt
                            ? new Date(tutor.createdAt).toLocaleDateString()
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-sm">
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
                    <TableHead>Class</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {classesForDate.map((cls) => (
                    <TableRow key={cls._id}>
                      <TableCell className="capitalize">
                        {cls.topic || "Class Session"}
                      </TableCell>

                      <TableCell className="capitalize">
                        {cls.subjectId?.name || "-"}
                      </TableCell>

                      <TableCell>
                        {cls.startTime
                          ? `${cls.startTime} (${cls.duration || 0} min)`
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
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

export default TenantDashboard;