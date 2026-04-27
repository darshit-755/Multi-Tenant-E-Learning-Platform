import { createContext, useCallback, useContext, useRef, useState } from "react";
import { markVideoAttendance } from "@/services/attendance.api";

const VideoProgressContext = createContext(null);

const STORAGE_KEY = "video-progress";
const ATTENDANCE_THRESHOLD = 75; // percent

/* ── helpers ─────────────────────────────────── */

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveToStorage = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota exceeded – silently ignore */
  }
};

/* ── provider ────────────────────────────────── */

export const VideoProgressProvider = ({ children }) => {
  // Shape: { [classId]: { videos: { [videoKey]: percent }, maxProgress: number, attendanceMarked: boolean } }
  const [progress, setProgress] = useState(() => loadFromStorage());
  const markingRef = useRef({}); // prevent duplicate API calls per class

  /**
   * Called on every `timeupdate` from a <video> element.
   * @param {string} classId
   * @param {string} videoKey  - unique identifier for the video within the class
   * @param {number} percent   - 0–100
   */
  const updateProgress = useCallback((classId, videoKey, percent) => {
    setProgress((prev) => {
      const classEntry = prev[classId] || { videos: {}, maxProgress: 0, attendanceMarked: false };
      const currentVideoPercent = classEntry.videos[videoKey] || 0;

      // Only update if the new value is higher (no rewinding decreases)
      if (percent <= currentVideoPercent) return prev;

      const updatedVideos = { ...classEntry.videos, [videoKey]: percent };

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

      saveToStorage(next);

      // Auto-mark attendance at threshold
      if (maxProgress >= ATTENDANCE_THRESHOLD && !classEntry.attendanceMarked && !markingRef.current[classId]) {
        markingRef.current[classId] = true;

        markVideoAttendance(classId)
          .then(() => {
            setProgress((p) => {
              const updated = {
                ...p,
                [classId]: { ...p[classId], attendanceMarked: true },
              };
              saveToStorage(updated);
              return updated;
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
  }, []);

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
