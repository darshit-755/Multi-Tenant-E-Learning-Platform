import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useMarkAttendance } from '../../hooks/tutor/useAttendance';

const AttendanceForm = ({
  classId,
  onSubmit,
  students = [],
  initialAttendance = [],
  isUpdateMode = false,
}) => {
  const markAttendanceMutation = useMarkAttendance();

  const createInitialAttendanceData = () => {
    if (students && students.length > 0) {
      const initialAttendanceMap = new Map(
        initialAttendance.map((record) => [String(record.studentId), record])
      );

      return students.map(student => ({
        studentId: student._id,
        present: initialAttendanceMap.get(String(student._id))?.present === true,
        notes: initialAttendanceMap.get(String(student._id))?.notes || ''
      }));
    }
    return [];
  };

  const { control, handleSubmit: onSubmitRHF, watch, setValue, reset } = useForm({
    defaultValues: {
      attendanceData: createInitialAttendanceData()
    }
  });

  const { fields } = useFieldArray({
    control,
    name: 'attendanceData'
  });

  useEffect(() => {
    const newData = createInitialAttendanceData();
    if (newData.length > 0) {
      reset({ attendanceData: newData });
    }
  }, [students, initialAttendance]);

  const attendanceData = watch('attendanceData');

  const handleSelectAll = (isPresent) => {
    attendanceData.forEach((_, index) => {
      setValue(`attendanceData.${index}.present`, isPresent);
    });
  };

  const handleSubmit = async (formData) => {
    try {
      const result = await markAttendanceMutation.mutateAsync({ 
        classId, 
        attendanceData: formData.attendanceData 
      });
      toast.success(isUpdateMode ? 'Attendance updated successfully!' : 'Attendance marked successfully!');
      
      if (onSubmit) {
        onSubmit(result);
      }
    } catch (error) {
      toast.error(error?.message || `Failed to ${isUpdateMode ? 'update' : 'mark'} attendance. Please try again.`);
      console.error('Error marking attendance:', error);
    }
  };

  const presentCount = attendanceData.filter(r => r.present).length;
  const totalStudents = attendanceData.length;
  const absentCount = totalStudents - presentCount;
  const allPresent = totalStudents > 0 && presentCount === totalStudents;
  const allAbsent = totalStudents > 0 && absentCount === totalStudents;

  return (
    <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-slate-900">
          {isUpdateMode ? 'Update Attendance' : 'Take Attendance'}
        </h2>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
            Total: {totalStudents}
          </span>
          <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-700">
            Present: {presentCount}
          </span>
          <span className="rounded-full bg-rose-100 px-3 py-1 font-medium text-rose-700">
            Absent: {absentCount}
          </span>
        </div>
      </div>

      <form onSubmit={onSubmitRHF(handleSubmit)}>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {/** Keep both buttons visually consistent; only active one is highlighted. */}
          <button
            type="button"
            className={`inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium transition ${
              allPresent
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
            onClick={() => handleSelectAll(true)}
          >
            Mark All Present
          </button>
          <button
            type="button"
            className={`inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium transition ${
              allAbsent
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
            onClick={() => handleSelectAll(false)}
          >
            Mark All Absent
          </button>
        </div>

        <div className="space-y-3">
          {fields.length > 0 ? (
            fields.map((field, index) => {
              const student = students.find(s => s._id === field.studentId);
              const record = attendanceData[index];
              return (
                <div
                  key={field.id}
                  className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1fr_1.4fr] sm:items-center"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-slate-900">{student?.userId?.name || 'Unknown'}</p>
                    <p className="text-xs text-slate-500">{student?.userId?.email || ''}</p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Controller
                      name={`attendanceData.${index}.present`}
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center gap-4">
                          <label className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
                            <input
                              type="checkbox"
                              checked={field.value === true}
                              onChange={(e) => {
                                field.onChange(e.target.checked ? true : false);
                              }}
                              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            Present
                          </label>

                          <label className="inline-flex items-center gap-2 text-sm font-medium text-rose-700">
                            <input
                              type="checkbox"
                              checked={field.value === false}
                              onChange={(e) => {
                                field.onChange(e.target.checked ? false : true);
                              }}
                              className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                            />
                            Absent
                          </label>
                        </div>
                      )}
                    />

                    <Controller
                      name={`attendanceData.${index}.notes`}
                      control={control}
                      render={({ field }) => (
                        <input
                          type="text"
                          placeholder="Notes (optional)"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none"
                        />
                      )}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              <p>No students in this batch</p>
            </div>
          )}
        </div>

        <div className="mt-5">
          <button
            type="submit"
            disabled={markAttendanceMutation.isPending || fields.length === 0}
            className="inline-flex h-10 items-center rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {markAttendanceMutation.isPending
              ? isUpdateMode
                ? 'Updating...'
                : 'Marking...'
              : isUpdateMode
                ? 'Update Attendance'
                : 'Submit Attendance'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AttendanceForm;
