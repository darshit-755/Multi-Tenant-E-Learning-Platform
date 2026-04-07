import axios from "axios";

const getZoomAccessToken = async () => {
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  if (!accountId || !clientId || !clientSecret) {
    throw new Error("Missing Zoom OAuth environment variables");
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const tokenRes = await axios.post(
    "https://zoom.us/oauth/token",
    null,
    {
      params: {
        grant_type: "account_credentials",
        account_id: accountId,
      },
      headers: {
        Authorization: `Basic ${basicAuth}`,
      },
    }
  );

  return tokenRes.data?.access_token;
};

export const createZoomMeeting = async ({
  topic = "Class Session",
  startDateTime,
  endDateTime,
}) => {
  const accessToken = await getZoomAccessToken();
  const zoomUserId = process.env.ZOOM_USER_ID;

  if (!accessToken) {
    throw new Error("Unable to fetch Zoom access token");
  }

  if (!zoomUserId) {
    throw new Error("Missing ZOOM_USER_ID environment variable");
  }

  const durationInMinutes = Math.max(
    1,
    Math.ceil((new Date(endDateTime) - new Date(startDateTime)) / (1000 * 60))
  );

  let meetingRes;
  try {
    meetingRes = await axios.post(
      `https://api.zoom.us/v2/users/${encodeURIComponent(zoomUserId)}/meetings`,
      {
        topic,
        type: 2,
        start_time: new Date(startDateTime).toISOString(),
        duration: durationInMinutes,
        timezone: process.env.ZOOM_TIMEZONE || "Asia/Kolkata",
        settings: {
          join_before_host: true,
          waiting_room: false,
          host_video: true,
          participant_video: true,
          mute_upon_entry: true,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  } catch (error) {
    const zoomMessage =
      error?.response?.data?.message ||
      error?.response?.data?.reason ||
      error?.message ||
      "Unknown Zoom API error";
    const status = error?.response?.status;
    throw new Error(
      `Zoom meeting creation failed${status ? ` (status ${status})` : ""}: ${zoomMessage}`
    );
  }

  const joinUrl = meetingRes.data?.join_url;
  if (!joinUrl) {
    throw new Error("Zoom meeting join URL was not generated");
  }

  return {
    meetLink: joinUrl,
    meetingId: meetingRes.data?.id ? String(meetingRes.data.id) : "",
    startUrl: meetingRes.data?.start_url || "",
    password: meetingRes.data?.password || "",
  };
};
