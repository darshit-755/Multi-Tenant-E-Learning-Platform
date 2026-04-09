import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AttendanceForm from '../../components/tutor/AttendanceForm';
import { useGetMyClasses } from '../../hooks/tutor/useGetMyClasses';
import { useGetClassAttendance } from '../../hooks/tutor/useAttendance';

const TakeAttendance = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const {
    data: classesData,
    isLoading: isClassesLoading,
    isError: isClassesError,
  } = useGetMyClasses();
  const {
    data: classAttendance,
    isLoading: isAttendanceLoading,
  } = useGetClassAttendance(classId, { enabled: Boolean(classId) });

  const classData = useMemo(
    () => classesData?.classes?.find((cls) => cls._id === classId) || null,
    [classesData, classId]
  );
  const students = classData?.batchId?.studentIds || [];
  const existingAttendance = classAttendance?.attendance || [];
  const isUpdateMode = existingAttendance.some((record) => Boolean(record._id));
  const loading = isClassesLoading || isAttendanceLoading;
  const error = isClassesError
    ? 'Failed to load class data. Please try again.'
    : !loading && !classData
      ? 'Class not found'
      : '';

  const handleAttendanceSubmit = () => {
    // Optionally redirect or show success message
    
      navigate('/tutor/my-classes');
    
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
        <div className="text-sm font-medium">Loading class information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 rounded-xl border border-rose-200 bg-rose-50 p-6">
        <div className="text-sm font-medium text-rose-700">{error}</div>
        <button
          onClick={() => navigate('/tutor/my-classes')}
          className="inline-flex h-9 items-center rounded-md bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-800"
        >
          Back to Classes
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 p-2 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          {isUpdateMode ? 'Update Attendance' : 'Take Attendance'}
        </h1>
        <button 
          onClick={() => navigate('/tutor/my-classes')}
          className="inline-flex h-9 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back to Classes
        </button>
      </div>

      {classData && (
        <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-md bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Subject</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{classData.subjectId?.name}</p>
          </div>
          <div className="rounded-md bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Batch</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{classData.batchId?.name}</p>
          </div>
          <div className="rounded-md bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{classData.date}</p>
          </div>
          <div className="rounded-md bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Time</p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {classData.startTime} ({classData.duration} mins)
            </p>
          </div>
          <div className="rounded-md bg-slate-50 p-3 sm:col-span-2 lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Topic</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{classData.topic || 'N/A'}</p>
          </div>
        </div>
      )}

      <AttendanceForm
        classId={classId}
        students={students}
        initialAttendance={existingAttendance}
        isUpdateMode={isUpdateMode}
        onSubmit={handleAttendanceSubmit}
      />
    </div>
  );
};

export default TakeAttendance;
