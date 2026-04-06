import cron from "node-cron";
import { Class } from "../models/class.model.js";
import { getClassStartDateTime } from "../utils/classHelper.js";

/**
 * Job to mark classes as completed
 * Runs every minute to check if any scheduled classes have ended + 15 minutes
 */
cron.schedule("* * * * *", async () => {
  try {
    console.log(" Running class completion job...");

    const now = new Date();

    // Get all scheduled classes
    const classes = await Class.find({ status: "scheduled" });

    for (const cls of classes) {
      // Calculate class start datetime
      const classStart = getClassStartDateTime(cls.date, cls.startTime);

      if (!classStart) continue;

      // Calculate end time (start + duration)
      const classEnd = new Date(classStart.getTime() + cls.duration * 60000);

      // Calculate completion time (end + 15 minutes)
      const completionTime = new Date(classEnd.getTime() + 15 * 60000);

      // If current time is past completion time, mark as completed
      if (now >= completionTime) {
        try {
          await Class.findByIdAndUpdate(
            cls._id,
            { status: "completed" },
            { new: true }
          );
          console.log(
            ` Class marked as completed: ${cls.topic || cls._id} (ended at ${classEnd.toISOString()})`
          );
        } catch (error) {
          console.error(
            ` Error updating class ${cls._id}:`,
            error.message
          );
        }
      }
    }
  } catch (error) {
    console.error(" Class completion job error:", error);
  }
});

console.log(" Class completion job initialized");
