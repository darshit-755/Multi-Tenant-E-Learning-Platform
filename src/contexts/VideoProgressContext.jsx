import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { markVideoAttendance, getMyVideoProgress, saveMyVideoProgress } from "@/services/attendance.api";

const VideoProgressContext = createContext(null);

const ATTENDANCE_THRESHOLD = 75; // percent

const mapProgressRecords = (records = []) =>
  records.reduce((acc, record) => {
    acc[record.classId] = {
      videos: record.videos || {},
      maxProgress: record.maxProgress || 0,
      attendanceMarked: record.attendanceMarked || false,
    };
    return acc;
  }, {});

const mergeProgressMaps = (current, incoming) => {
  const merged = { ...current };

  Object.entries(incoming).forEach(([classId, incomingEntry]) => {
    const currentEntry = merged[classId] || { videos: {}, maxProgress: 0, attendanceMarked: false };
    const combinedVideos = { ...currentEntry.videos };

    Object.entries(incomingEntry.videos || {}).forEach(([videoKey, percent]) => {
      const currentPercent = Number(combinedVideos[videoKey] || 0);
      combinedVideos[videoKey] = Math.max(currentPercent, Number(percent) || 0);
    });

    const maxProgress = Math.max(
      currentEntry.maxProgress || 0,
      incomingEntry.maxProgress || 0,
      ...Object.values(combinedVideos).map((value) => Number(value) || 0)
    );

    merged[classId] = {
      videos: combinedVideos,
      maxProgress,
      attendanceMarked: currentEntry.attendanceMarked || incomingEntry.attendanceMarked || false,
    };
  });

  return merged;
};

/* ── provider ────────────────────────────────── */

export const VideoProgressProvider = ({ children }) => {
  // Shape: { [classId]: { videos: { [videoKey]: percent }, maxProgress: number, attendanceMarked: boolean } }
  const [progress, setProgress] = useState({});
  const persistedProgressRef = useRef({});
  const attendanceMarkedRef = useRef({});
  const markingRef = useRef({}); // prevent duplicate API calls per class

  const { data: remoteProgressData } = useQuery({
    queryKey: ["student-video-progress", "me"],
    queryFn: getMyVideoProgress,
  });

  useEffect(() => {
    if (!remoteProgressData?.progress) return;

    const incoming = mapProgressRecords(remoteProgressData.progress);
    setProgress((current) => mergeProgressMaps(current, incoming));
    persistedProgressRef.current = mergeProgressMaps(persistedProgressRef.current, incoming);

    const marked = remoteProgressData.progress.reduce((acc, record) => {
      if (record.attendanceMarked) {
        acc[record.classId] = true;
      }
      return acc;
    }, {});
    attendanceMarkedRef.current = {
      ...attendanceMarkedRef.current,
      ...marked,
    };
  }, [remoteProgressData]);

  const persistProgress = useCallback(async ({ classId, videoKey, percent, attendanceMarked = false }) => {
    if (!classId || !videoKey) return;

    const nextPercent = Math.max(0, Math.min(100, Math.round(percent * 100) / 100));
    const currentPersistedClass = persistedProgressRef.current[classId] || { videos: {}, maxProgress: 0, attendanceMarked: false };
    const currentPersistedVideo = Number(currentPersistedClass.videos?.[videoKey] || 0);
    const shouldPersistPercent = nextPercent > currentPersistedVideo;
    const shouldPersistAttendance = attendanceMarked && !currentPersistedClass.attendanceMarked;

    if (!shouldPersistPercent && !shouldPersistAttendance) {
      return;
    }

    const response = await saveMyVideoProgress({
      classId,
      videoKey,
      percent: shouldPersistPercent ? nextPercent : currentPersistedVideo,
      attendanceMarked: shouldPersistAttendance,
    });

    if (response?.progress) {
      const nextEntry = response.progress;
      persistedProgressRef.current = {
        ...persistedProgressRef.current,
        [classId]: {
          videos: nextEntry.videos || {},
          maxProgress: nextEntry.maxProgress || 0,
          attendanceMarked: nextEntry.attendanceMarked || false,
        },
      };
      if (nextEntry.attendanceMarked) {
        attendanceMarkedRef.current[classId] = true;
      }
      setProgress((current) => ({
        ...current,
        [classId]: {
          videos: nextEntry.videos || {},
          maxProgress: nextEntry.maxProgress || 0,
          attendanceMarked: nextEntry.attendanceMarked || false,
        },
      }));
    }
  }, []);

  /**
   * Called on every `timeupdate` from a <video> element.
   * @param {string} classId
   * @param {string} videoKey  - unique identifier for the video within the class
   * @param {number} percent   - 0–100
   */
  const updateProgress = useCallback((classId, videoKey, percent) => {
    if (!classId || !videoKey || typeof percent !== "number") return;

    const normalizedPercent = Math.max(0, Math.min(100, Math.round(percent * 100) / 100));
    let shouldPersist = false;
    let shouldMarkAttendance = false;
    let currentMaxProgress = 0;

    setProgress((prev) => {
      const classEntry = prev[classId] || { videos: {}, maxProgress: 0, attendanceMarked: false };
      const currentVideoPercent = classEntry.videos[videoKey] || 0;

      // Only update if the new value is higher (no rewinding decreases)
      if (normalizedPercent <= currentVideoPercent) return prev;

      const updatedVideos = { ...classEntry.videos, [videoKey]: normalizedPercent };

      // Compute max progress across all videos in this class
      const maxProgress = Math.max(...Object.values(updatedVideos));

      const next = {
        ...prev,
        [classId]: {
          ...classEntry,
          videos: updatedVideos,
          maxProgress,
        },
      };

      currentMaxProgress = maxProgress;
      const persistedVideoPercent = Number(persistedProgressRef.current[classId]?.videos?.[videoKey] || 0);
      shouldPersist = normalizedPercent > persistedVideoPercent + 0.5 || (persistedVideoPercent === 0 && normalizedPercent > 0);

      // Auto-mark attendance at threshold
      if (maxProgress >= ATTENDANCE_THRESHOLD && !classEntry.attendanceMarked && !markingRef.current[classId]) {
        markingRef.current[classId] = true;
        shouldMarkAttendance = true;

        markVideoAttendance(classId)
          .then(() => {
            attendanceMarkedRef.current[classId] = true;
            setProgress((p) => {
              const updated = {
                ...p,
                [classId]: { ...p[classId], attendanceMarked: true },
              };
              persistedProgressRef.current = {
                ...persistedProgressRef.current,
                [classId]: {
                  ...(persistedProgressRef.current[classId] || { videos: {}, maxProgress: 0, attendanceMarked: false }),
                  attendanceMarked: true,
                },
              };
              return updated;
            });

            saveMyVideoProgress({
              classId,
              videoKey,
              percent: currentMaxProgress,
              attendanceMarked: true,
            }).catch((err) => {
              console.error("Failed to persist attendance flag:", err);
            });
          })
          .catch((err) => {
            console.error("Failed to mark video attendance:", err);
            // Allow retry on next threshold cross
            markingRef.current[classId] = false;
          });
      }

      return next;
    });

    if (shouldPersist) {
      persistProgress({
        classId,
        videoKey,
        percent: normalizedPercent,
        attendanceMarked: attendanceMarkedRef.current[classId] || shouldMarkAttendance,
      }).catch((err) => {
        console.error("Failed to persist video progress:", err);
      });
    }
  }, [persistProgress]);

  /**
   * Get the progress entry for a specific class.
   * Returns { maxProgress: number, attendanceMarked: boolean } or null.
   */
  const getClassProgress = useCallback(
    (classId) => {
      if (!classId || !progress[classId]) return null;
      return {
        maxProgress: progress[classId].maxProgress || 0,
        attendanceMarked: progress[classId].attendanceMarked || false,
      };
    },
    [progress]
  );

  /**
   * Get progress for a specific video within a class.
   * @returns {number} 0–100
   */
  const getVideoProgress = useCallback(
    (classId, videoKey) => {
      if (!classId || !progress[classId]) return 0;
      return progress[classId].videos?.[videoKey] || 0;
    },
    [progress]
  );

  return (
    <VideoProgressContext.Provider value={{ progress, updateProgress, getClassProgress, getVideoProgress }}>
      {children}
    </VideoProgressContext.Provider>
  );
};

export const useVideoProgress = () => {
  const ctx = useContext(VideoProgressContext);
  if (!ctx) {
    throw new Error("useVideoProgress must be used inside <VideoProgressProvider>");
  }
  return ctx;
};

export default VideoProgressContext;
