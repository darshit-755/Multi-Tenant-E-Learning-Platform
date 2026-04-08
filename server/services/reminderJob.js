import cron from "node-cron";
import { Class } from "../models/class.model.js";
import { User } from "../models/user.model.js";
import { sendTenantMail} from "./mail/mail.service.js";
import {MAIL_TYPES} from "../services/mail/mail.constant.js"
import {getClassStartDateTime} from "../utils/classHelper.js"


cron.schedule("* * * * *", async () => {
  try {
    console.log(" Running reminder job...");

    const now = new Date();

    // Check upcoming scheduled classes.
    const classes = await Class.find({
      status: "scheduled",
    })
      .populate("subjectId", "name")
      .populate({
        path: "teacherId",
        populate: { path: "userId", select: "name email" },
      })
      .populate({
        path: "batchId",
        populate: {
          path: "studentIds",
          populate: { path: "userId", select: "name email" },
        },
      });

    for (const cls of classes) {
      const classStart = getClassStartDateTime(cls.date, cls.startTime);

      if (!classStart) continue;

      const reminderMinutes = cls.reminderTime || 0;

      const reminderAt = new Date(
        classStart.getTime() - reminderMinutes * 60000
      );

      // Fire once around the reminder minute to avoid duplicate sends.
      if (now >= reminderAt && now < new Date(reminderAt.getTime() + 60000)) {
        console.log(` Sending reminder for class: ${cls.topic || "Class"}`);

        const scheduleTimeText = `${cls.startTime || ""} (${cls.duration || 0} mins)`;
        const subjectName = cls.subjectId?.name || "N/A";
        const className = cls.topic || "Class Session";
        const videoLink = cls.videoLink || "";
        const videoProvider = cls.videoProvider || "manual";

        if (cls.batchId?.studentIds?.length > 0) {
          const studentUsers = cls.batchId.studentIds
            .map((studentProfile) => studentProfile?.userId)
            .filter(Boolean);

          await Promise.all(
            studentUsers.map((student) =>
              sendTenantMail(MAIL_TYPES.CLASS_REMINDER_STUDENT, {
                name: student.name,
                email: student.email,
                className,
                subject: subjectName,
                scheduleDays: cls.date,
                scheduleTime: scheduleTimeText,
                videoProvider,
                meetingLink: videoLink,
                meetLink: videoLink,
              })
            )
          );
        }

        if (cls.teacherId?.userId) {
          const tutorUser = await User.findById(cls.teacherId.userId).select("name email");

          if (tutorUser) {
            await sendTenantMail(MAIL_TYPES.CLASS_REMINDER_TUTOR, {
              name: tutorUser.name,
              email: tutorUser.email,
              className,
              subject: subjectName,
              scheduleDays: cls.date,
              scheduleTime: scheduleTimeText,
              videoProvider,
              meetingLink: videoLink,
              meetLink: videoLink,
            });
          }
        }
      }
    }
  } catch (error) {
    console.error("Reminder Job Error:", error);
  }
});