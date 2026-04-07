import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useGetMyAttendance } from '../../hooks/student/useGetMyAttendance';

const StudentAttendance = () => {
  const { user } = useAuth();
  const {
    data: attendanceData,
    isLoading: loading,
    isError,
  } = useGetMyAttendance({ enabled: user?.role === 'student' });

  const error = user?.role !== 'student'
    ? 'Only student accounts can access this page.'
    : isError
      ? 'Failed to load attendance data. Please try again.'
      : '';

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-sm font-medium text-slate-600">
        Loading attendance data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
        {error}
      </div>
    );
  }

  if (!attendanceData) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
        No attendance data available.
      </div>
    );
  }

  const { student, statistics, attendance } = attendanceData;

  const getStatusBadge = (present) => {
    if (present === null) {
      return (
        <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
          Not Marked
        </span>
      );
    }

    return present ? (
      <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        Present
      </span>
    ) : (
      <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
        Absent
      </span>
    );
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-2 sm:p-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">My Attendance</h2>
          {student && (
            <p className="text-sm text-slate-600">{student.name}</p>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Classes</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{statistics.totalClasses}</div>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Present</div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">{statistics.presentCount}</div>
        </div>

        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-rose-700">Absent</div>
          <div className="mt-2 text-2xl font-bold text-rose-700">{statistics.absentCount}</div>
        </div>

        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Attendance %</div>
          <div className="mt-2 text-2xl font-bold text-indigo-700">{statistics.attendancePercentage}%</div>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Attendance Records</h3>

        {attendance && attendance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Time</th>
                  <th className="px-3 py-2">Subject</th>
                  <th className="px-3 py-2">Topic</th>
                  <th className="px-3 py-2">Tutor</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => (
                  <tr key={record._id} className="border-b border-slate-100 text-slate-700">
                    <td className="px-3 py-2">
                      {new Date(record.classDate).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2">{record.classTime}</td>
                    <td className="px-3 py-2">{record.subject || 'N/A'}</td>
                    <td className="px-3 py-2 max-w-[16rem] truncate" title={record.topic || ''}>
                      {record.topic || <span className="text-slate-400">-</span>}
                    </td>
                    <td className="px-3 py-2">{record.tutorName || 'N/A'}</td>
                    <td className="px-3 py-2">{getStatusBadge(record.present)}</td>
                    <td className="px-3 py-2 max-w-[18rem] truncate" title={record.notes || ''}>
                      {record.notes || <span className="text-slate-400">-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
            <p>No attendance records available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAttendance;
