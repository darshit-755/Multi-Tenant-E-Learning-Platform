import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetStudents } from "@/hooks/tenant/useGetStudents";

export default function StudentDetails() {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const { data, isLoading } = useGetStudents();

  const student = useMemo(
    () => data?.students?.find((item) => item._id === studentId),
    [data, studentId],
  );

  const enrolledBatches = student?.batches || student?.batchIds || [];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/tenant/students/view")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Students
        </Button>

        <h1 className="text-3xl font-bold">Student Details</h1>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading student details...</p>
      ) : !student ? (
        <p className="text-sm text-muted-foreground">Student not found.</p>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium capitalize">{student?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{student?.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{student?.status || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Roll Number</p>
                  <p className="font-medium">{student?.rollNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Class</p>
                  <p className="font-medium">{student?.classLevel || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Board</p>
                  <p className="font-medium">{student?.board || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{student?.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Father Name</p>
                  <p className="font-medium">{student?.fatherName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mother Name</p>
                  <p className="font-medium">{student?.motherName || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enrolled Batches</CardTitle>
            </CardHeader>
            <CardContent>
              {enrolledBatches.length > 0 ? (
                <div className="space-y-2">
                  {enrolledBatches.map((batch) => (
                    <div
                      key={batch?._id || batch?.batchId || String(batch)}
                      className="bg-muted p-3 rounded-md"
                    >
                      <p className="font-medium">{batch?.name || "Unnamed Batch"}</p>
                      <p className="text-sm text-muted-foreground">
                        Subject: {batch?.subject || batch?.subjectId?.name || "N/A"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No batches enrolled</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
