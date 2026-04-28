import { useParams, useNavigate } from "react-router-dom";
import { useStudentDetails } from "@/hooks/admin/useStudentDetails";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Loader from "@/components/common/Loader";

const StudentDetails = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const { data: student, isLoading, isError } = useStudentDetails(studentId);

  if (isLoading) return <Loader />;

  if (isError) {
    return (
      <div className="p-6">
        <p className="text-red-500">Failed to load student details</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/admin/students")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Students
        </Button>

        <h1 className="text-3xl font-bold">Student Details</h1>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium capitalize">{student?.userId?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{student?.userId?.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium capitalize">{student?.status || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Center</p>
                <p className="font-medium capitalize">{student?.tenantId?.name || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Information */}
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

        {/* Personal Information */}
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

        {/* Batches */}
        <Card>
          <CardHeader>
            <CardTitle>Enrolled Batches</CardTitle>
          </CardHeader>
          <CardContent>
            {student?.batches && student.batches.length > 0 ? (
              <div className="space-y-2">
                {student.batches.map((batch) => (
                  <div key={batch._id} className="bg-muted p-3 rounded-md">
                    <p className="font-medium">{batch.name}</p>
                    <p className="text-sm text-muted-foreground">Subject: {batch.subject}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No batches enrolled</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDetails;