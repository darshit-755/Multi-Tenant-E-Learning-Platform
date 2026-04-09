// Convert 24h time (14:30) -> 12h time (2:30 PM)
export const formatTime12h = (time24) => {
  if (!time24) return "";

  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;

  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
};

// Convert 12h time (2:30 PM) -> 24h time (14:30)
export const parseTime12to24 = (time12) => {
  if (!time12) return "";

  const match = time12.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return "";

  let [, hours, minutes, period] = match;
  hours = parseInt(hours);

  if (period.toUpperCase() === "PM" && hours !== 12) hours += 12;
  if (period.toUpperCase() === "AM" && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, "0")}:${minutes}`;
};

// Format date with weekday
export const formatDateWithDay = (dateStr) => {
  if (!dateStr) return "-";

  const date = new Date(dateStr + "T00:00:00");
  if (isNaN(date.getTime())) return dateStr;

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Get classes scheduled for selected date
export const getClassesForDate = (classes, dateStr) => {
  if (!dateStr) return [];

  const selectedDate = new Date(dateStr + "T00:00:00");

  const selectedDayOfWeek = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
  });

  return classes.filter((cls) => {
    const scheduledDays = cls.schedule?.days?.trim().toLowerCase() || "";
    const selectedDay = selectedDayOfWeek.toLowerCase();

    return (
      scheduledDays === selectedDay ||
      scheduledDays === dateStr ||
      cls.schedule?.days === dateStr
    );
  });
};