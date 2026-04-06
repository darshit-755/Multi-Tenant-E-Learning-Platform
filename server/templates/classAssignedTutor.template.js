const formatSchedule = (days = "", time = "") => {
  const dayText = days;
  const timeText = time;
  return `${dayText} at ${timeText}`;
};


export const classAssignedTutorTemplate = (user) => ({
  subject: `New Class Assigned: ${user.className || "Class"}`,
  html: `
  <body style="margin:0;padding:0;background:#f7fafc;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
            <tr>
              <td style="background:#0f766e;color:#ffffff;padding:18px 24px;font-size:20px;font-weight:700;">
                Class Assignment Update
              </td>
            </tr>
            <tr>
              <td style="padding:24px;color:#1f2937;font-size:14px;line-height:1.7;">
                <p style="margin:0 0 14px;">Hello ${user.name || "Tutor"},</p>
                <p style="margin:0 0 14px;">A new class has been assigned to you.</p>
                <p style="margin:0 0 8px;"><strong>Role:</strong> Tutor</p>
                <p style="margin:0 0 8px;"><strong>Class:</strong> ${user.className || "N/A"}</p>
                <p style="margin:0 0 8px;"><strong>Subject:</strong> ${user.subject || "N/A"}</p>
                <p style="margin:0 0 14px;"><strong>Schedule:</strong> ${formatSchedule(user.scheduleDays, user.scheduleTime)}</p>
                ${
                  user.meetLink
                    ? `
                  <div style="margin-top:20px;text-align:center;">
                    <a href="${user.meetLink}" target="_blank"
                      style="background:#16a34a;color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600;">
                      🎥 Join Meeting
                    </a>
                  </div>
                `
                    : ""
                }
                <p style="margin-top:20px;">Please log in to your dashboard for more details.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  `,
});
