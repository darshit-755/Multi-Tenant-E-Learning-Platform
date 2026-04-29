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
  // Track the latest progress per video to avoid React 18 batching issues
  const latestProgressRef = useRef({});
  // Track in-flight API calls to prevent duplicates
  const savingRef = useRef({});

  const { data: remoteProgressData } = useQuery({
    queryKey: ["student-video-progress", "me"],
    queryFn: getMyVideoProgress,
  });

  useEffect(() => {
    if (!remoteProgressData?.progress) return;

    const incoming = mapProgressRecords(remoteProgressData.progress);
    setProgress((current) => mergeProgressMaps(current, incoming));
    persistedProgressRef.current = mergeProgressMaps(persistedProgressRef.current, incoming);

    // Also sync the latest progress ref so we don't re-persist already saved progress
    Object.entries(incoming).forEach(([classId, entry]) => {
      Object.entries(entry.videos || {}).forEach(([videoKey, percent]) => {
        const key = `${classId}:${videoKey}`;
        const current = Number(latestProgressRef.current[key] || 0);
        latestProgressRef.current[key] = Math.max(current, Math.floor(Number(percent) || 0));
      });
    });

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

  // Track pending progress to save after current in-flight call completes
  const pendingProgressRef = useRef({});

  const persistProgress = useCallback(async ({ classId, videoKey, percent, attendanceMarked = false }) => {
    if (!classId || !videoKey) return;

    const nextPercent = Math.max(0, Math.min(100, Math.floor(percent)));
    const persistKey = `${classId}:${videoKey}`;
    const currentPersistedClass = persistedProgressRef.current[classId] || { videos: {}, maxProgress: 0, attendanceMarked: false };
    const currentPersistedVideo = Math.floor(Number(currentPersistedClass.videos?.[videoKey] || 0));
    const shouldPersistPercent = nextPercent > currentPersistedVideo;
    const shouldPersistAttendance = attendanceMarked && !currentPersistedClass.attendanceMarked;

    if (!shouldPersistPercent && !shouldPersistAttendance) {
      return;
    }

    // If a save is already in-flight, queue the latest value (overwrites any previous pending)
    if (savingRef.current[persistKey]) {
      pendingProgressRef.current[persistKey] = { classId, videoKey, percent: nextPercent, attendanceMarked };
      return;
    }
    savingRef.current[persistKey] = true;

    try {
      const response = await saveMyVideoProgress({
        classId,
        videoKey,
        percent: nextPercent,
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
    } finally {
      savingRef.current[persistKey] = false;

      // If a newer progress was queued while this call was in-flight, persist it now
      const pending = pendingProgressRef.current[persistKey];
      if (pending) {
        delete pendingProgressRef.current[persistKey];
        persistProgress(pending).catch((err) => {
          console.error("Failed to persist pending video progress:", err);
        });
      }
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

    // Floor to whole percent — we persist on every 1% increase
    const wholePercent = Math.max(0, Math.min(100, Math.floor(percent)));
    const progressKey = `${classId}:${videoKey}`;

    // Check against our ref (not React state) to avoid batching issues
    const lastKnownPercent = Number(latestProgressRef.current[progressKey] || 0);
    if (wholePercent <= lastKnownPercent) return;

    // Update our ref immediately (synchronous, no batching issues)
    latestProgressRef.current[progressKey] = wholePercent;

    // Update React state for UI
    setProgress((prev) => {
      const classEntry = prev[classId] || { videos: {}, maxProgress: 0, attendanceMarked: false };
      const updatedVideos = { ...classEntry.videos, [videoKey]: wholePercent };
      const maxProgress = Math.max(...Object.values(updatedVideos));

      return {
        ...prev,
        [classId]: {
          ...classEntry,
          videos: updatedVideos,
          maxProgress,
        },
      };
    });

    // Compute maxProgress from refs (outside state updater to avoid side effects in pure functions)
    // Collect all video progresses for this class from latestProgressRef
    const classPrefix = `${classId}:`;
    let maxProgress = 0;
    Object.entries(latestProgressRef.current).forEach(([key, val]) => {
      if (key.startsWith(classPrefix)) {
        maxProgress = Math.max(maxProgress, Number(val) || 0);
      }
    });

    // Auto-mark attendance at threshold (side effect outside state updater)
    if (maxProgress >= ATTENDANCE_THRESHOLD && !attendanceMarkedRef.current[classId] && !markingRef.current[classId]) {
      markingRef.current[classId] = true;

      markVideoAttendance(classId)
        .then(() => {
          attendanceMarkedRef.current[classId] = true;
          setProgress((p) => ({
            ...p,
            [classId]: { ...p[classId], attendanceMarked: true },
          }));
          persistedProgressRef.current = {
            ...persistedProgressRef.current,
            [classId]: {
              ...(persistedProgressRef.current[classId] || { videos: {}, maxProgress: 0, attendanceMarked: false }),
              attendanceMarked: true,
            },
          };

          saveMyVideoProgress({
            classId,
            videoKey,
            percent: maxProgress,
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

    // Always persist — the check is done via ref, not state, so no batching issues.
    // persistProgress itself checks against persistedProgressRef to avoid redundant calls.
    persistProgress({
      classId,
      videoKey,
      percent: wholePercent,
      attendanceMarked: attendanceMarkedRef.current[classId] || false,
    }).catch((err) => {
      console.error("Failed to persist video progress:", err);
    });
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
