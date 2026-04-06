// Helper: convert date + "HH:mm" to Date
export const getClassStartDateTime = (dateStr, startTime) => {
  if (!dateStr || !startTime) return null;

  const [hours, minutes] = String(startTime)
    .split(":")
    .map((value) => Number(value));

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;

  date.setHours(hours, minutes, 0, 0);
  return date;
};
