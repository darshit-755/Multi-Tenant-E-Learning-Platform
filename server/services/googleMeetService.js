import { google } from "googleapis";
import { oauth2Client } from "../configs/googleClient.js";

export const createGoogleMeet = async ({
  startDateTime,
  endDateTime,
}) => {
  try {
    const calendar = google.calendar({
      version: "v3",
      auth: oauth2Client,
    });

    const event = {
      summary: "Class Session",
      description: "Scheduled via your app",
      start: {
        dateTime: startDateTime,
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: endDateTime,
        timeZone: "Asia/Kolkata",
      },
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`, // unique
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
      conferenceDataVersion: 1, 
    });

    const meetLink =
      response.data?.conferenceData?.entryPoints?.[0]?.uri;

    if (!meetLink) {
      throw new Error("Meet link not generated");
    }

    return meetLink;
  } catch (error) {
    console.error("Google Meet Error:", error.message);
    throw error;
  }
};