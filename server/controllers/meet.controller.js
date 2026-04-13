import { createGoogleMeet } from "../services/googleMeetService.js";
import { createZoomMeeting } from "../services/zoomMeetingService.js";

export const createMeetLink = async (req, res) => {
  try {
    const { date, startTime, endTime, provider = "gmeet", topic } = req.body;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Date, start time and end time are required",
      });
    }

    if (!["gmeet", "zoom"].includes(provider)) {
      return res.status(400).json({
        success: false,
        message: "provider must be gmeet or zoom",
      });
    }

    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    let response;
    if (provider === "zoom") {
      response = await createZoomMeeting({
        topic: topic || "Class Session",
        startDateTime,
        endDateTime,
      });
    } else {
      const meetLink = await createGoogleMeet({
        startDateTime,
        endDateTime,
      });
      response = { meetLink };
    }

    return res.status(200).json({
      success: true,
      provider,
      ...response,
    });
  } catch (error) {
    console.error("Meeting Link Generation Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create meeting link",
    });
  }
};
