import React, { useMemo, useState } from 'react';
import { useGetClasses } from '../../hooks/tenant/useGetClasses';
import { useGetAttendanceSummary } from '../../hooks/tenant/useAttendanceSummary';

const getAttendanceColor = (value) => {
  const percentage = Number.parseFloat(value) || 0;

  if (percentage <= 40) return '#e74c3c';
  if (percentage <= 75) return '#f59e0b';
  return '#27ae60';
};

const BatchAttendanceReport = () => {
  const [selectedBatch, setSelectedBatch] = useState('');
  const {
    data: classesData,
    isLoading: isClassesLoading,
    isError: isClassesError,
  } = useGetClasses();
  const {
    data: attendanceData,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
  } = useGetAttendanceSummary(selectedBatch, { enabled: Boolean(selectedBatch) });

  const batches = useMemo(() => {
    const uniqueBatches = {};
    classesData?.classes?.forEach((classItem) => {
      if (classItem.batchId && !uniqueBatches[classItem.batchId._id]) {
        uniqueBatches[classItem.batchId._id] = classItem.batchId;
      }
    });

    return Object.values(uniqueBatches);
  }, [classesData]);

  const handleBatchChange = (batchId) => {
    setSelectedBatch(batchId);
  };

  const loading = isClassesLoading || (Boolean(selectedBatch) && isSummaryLoading);
  const error = isClassesError || isSummaryError
    ? 'Failed to load attendance data. Please try again.'
    : '';

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 p-2 sm:p-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-2xl font-bold text-slate-900">Batch Attendance Report</h2>
        <p className="mt-1 text-sm text-slate-600">View attendance statistics for all students in a batch</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <label htmlFor="batch-select" className="mb-2 block text-sm font-medium text-slate-700">Select Batch:</label>
        <select
          id="batch-select"
          value={selectedBatch}
          onChange={(e) => handleBatchChange(e.target.value)}
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:border-slate-500 focus:outline-none"
        >
          <option value="">-- Choose a batch --</option>
          {batches.map(batch => (
            <option key={batch._id} value={batch._id}>
              {batch.name}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center text-sm font-medium text-slate-600">
          Loading attendance data...
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      {attendanceData && (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Batch</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{attendanceData.batchName}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Classes</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{attendanceData.totalClasses}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Students</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{attendanceData.totalStudents}</p>
            </div>
          </div>

          {attendanceData.summary && attendanceData.summary.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-2">Student Name</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Total Classes</th>
                      <th className="px-3 py-2">Present</th>
                      <th className="px-3 py-2">Absent</th>
                      <th className="px-3 py-2">Attendance %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.summary.map((student) => (
                      <tr
                        key={student.studentId}
                        className="border-b border-slate-100"
                      >
                        <td className="px-3 py-2 text-slate-800">{student.studentName}</td>
                        <td className="px-3 py-2 text-slate-700">{student.studentEmail}</td>
                        <td className="px-3 py-2 text-slate-700">{student.totalClasses}</td>
                        <td className="px-3 py-2 font-semibold text-emerald-700">{student.presentCount}</td>
                        <td className="px-3 py-2 font-semibold text-rose-700">{student.absentCount}</td>
                        <td className="px-3 py-2">
                          <div className="relative h-7 w-full overflow-hidden rounded-md bg-slate-100">
                            <div
                              className="absolute inset-y-0 left-0"
                              style={{
                                width: `${student.attendancePercentage}%`,
                                backgroundColor: getAttendanceColor(student.attendancePercentage)
                              }}
                            />
                            <span className="relative z-10 flex h-full items-center justify-center text-xs font-semibold text-slate-900">
                              {student.attendancePercentage}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No attendance data available for this batch.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BatchAttendanceReport;
