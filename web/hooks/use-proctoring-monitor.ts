"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getFaceDetector } from "@/lib/face-detector";

export type WarningType = "NO_FACE" | "MULTIPLE_FACES" | null;

export type DetectionSummary = {
  faceCount: number;
  warningType: WarningType;
  detectionConfidence: number | null;
};

export type ProctoringEvent = {
  id: string;
  examSessionId: string;
  capturedAt: string;
  faceCount: number;
  warningType: Exclude<WarningType, null>;
  detectionConfidence: number | null;
};

type UseProctoringMonitorOptions = {
  intervalMs?: number;
  maxIncidents?: number;
  autoStart?: boolean;
};

function createSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `exam-${crypto.randomUUID()}`;
  }

  return `exam-${Date.now()}`;
}

function createEventId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `event-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function waitForVideoMetadata(video: HTMLVideoElement) {
  if (video.readyState >= 1) return;

  await new Promise<void>((resolve) => {
    const onLoadedMetadata = () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      resolve();
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
  });
}

async function waitForVideoReady(video: HTMLVideoElement, timeoutMs = 5000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    if (
      video.readyState >= 2 &&
      video.videoWidth > 0 &&
      video.videoHeight > 0
    ) {
      return;
    }

    await new Promise((resolve) => requestAnimationFrame(resolve));
  }

  throw new Error("Video frame not ready");
}

export function useProctoringMonitor(
  options: UseProctoringMonitorOptions = {},
) {
  const { intervalMs = 10000, maxIncidents = 20, autoStart = true } = options;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedRef = useRef(false);
  const sessionIdRef = useRef("");
  const lastTimestampRef = useRef(-1);
  const trackCleanupRef = useRef<(() => void) | null>(null);
  const lastErrorRef = useRef("");

  const [sessionId, setSessionId] = useState("");
  const [lastCheckedAt, setLastCheckedAt] = useState("");
  const [warningCount, setWarningCount] = useState(0);
  const [incidents, setIncidents] = useState<ProctoringEvent[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentWarning, setCurrentWarning] = useState<WarningType>(null);
  const [faceCount, setFaceCount] = useState(0);

  const logErrorOnce = useCallback((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);

    if (lastErrorRef.current !== message) {
      console.error(message);
      lastErrorRef.current = message;
    }
  }, []);

  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (trackCleanupRef.current) {
      trackCleanupRef.current();
      trackCleanupRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    const video = videoRef.current;
    if (video) {
      try {
        video.pause();
      } catch {
        // ignore
      }

      video.srcObject = null;
    }

    startedRef.current = false;
    lastTimestampRef.current = -1;
    lastErrorRef.current = "";
    setIsMonitoring(false);
    setCurrentWarning(null);
    setFaceCount(0);
  }, []);

  const detectFaces = useCallback(
    async (video: HTMLVideoElement): Promise<DetectionSummary | null> => {
      if (
        video.readyState < 2 ||
        video.videoWidth <= 0 ||
        video.videoHeight <= 0
      ) {
        return {
          faceCount: 0,
          warningType: "NO_FACE",
          detectionConfidence: null,
        };
      }

      const timestampMs = Math.floor(video.currentTime * 1000);

      if (timestampMs <= lastTimestampRef.current) {
        return null;
      }

      lastTimestampRef.current = timestampMs;

      try {
        const detector = await getFaceDetector();
        const result = detector.detectForVideo(video, timestampMs);

        const detectedFaceCount = result.detections.length;

        let detectionConfidence: number | null = null;

        if (detectedFaceCount > 0) {
          const scores = result.detections
            .map((item) => item.categories?.[0]?.score ?? 0)
            .filter((value) => Number.isFinite(value));

          if (scores.length > 0) {
            detectionConfidence = Math.max(...scores);
          }
        }

        if (detectedFaceCount === 0) {
          return {
            faceCount: 0,
            warningType: "NO_FACE",
            detectionConfidence,
          };
        }

        if (detectedFaceCount > 1) {
          return {
            faceCount: detectedFaceCount,
            warningType: "MULTIPLE_FACES",
            detectionConfidence,
          };
        }

        return {
          faceCount: 1,
          warningType: null,
          detectionConfidence,
        };
      } catch (error) {
        logErrorOnce(error);

        return {
          faceCount: 0,
          warningType: "NO_FACE",
          detectionConfidence: null,
        };
      }
    },
    [logErrorOnce],
  );

  const addIncident = useCallback(
    (currentSessionId: string, detection: DetectionSummary) => {
      if (!detection.warningType) return;

      const newEvent: ProctoringEvent = {
        id: createEventId(),
        examSessionId: currentSessionId,
        capturedAt: new Date().toISOString(),
        faceCount: detection.faceCount,
        warningType: detection.warningType,
        detectionConfidence: detection.detectionConfidence,
      };

      setIncidents((prev) => [newEvent, ...prev].slice(0, maxIncidents));
      setWarningCount((prev) => prev + 1);
    },
    [maxIncidents],
  );

  const checkProctoring = useCallback(async () => {
    const video = videoRef.current;
    const stream = streamRef.current;
    const currentSessionId = sessionIdRef.current;

    if (!video || !stream || !currentSessionId) return null;

    const [track] = stream.getVideoTracks();

    if (!track || track.readyState !== "live") {
      stopMonitoring();
      return null;
    }

    if (
      video.readyState < 2 ||
      video.videoWidth <= 0 ||
      video.videoHeight <= 0
    ) {
      return null;
    }

    const detection = await detectFaces(video);

    if (!detection) return null;

    setFaceCount(detection.faceCount);
    setCurrentWarning(detection.warningType);
    setLastCheckedAt(new Date().toLocaleTimeString());

    addIncident(currentSessionId, detection);

    return detection;
  }, [addIncident, detectFaces, stopMonitoring]);

  const startCamera = useCallback(async () => {
    const video = videoRef.current;

    if (!video) {
      throw new Error("Video element not found");
    }

    if (streamRef.current) {
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
      audio: false,
    });

    streamRef.current = stream;

    const [track] = stream.getVideoTracks();

    const handleTrackStopLikeEvent = () => {
      stopMonitoring();
    };

    if (track) {
      track.addEventListener("ended", handleTrackStopLikeEvent);
      track.addEventListener("mute", handleTrackStopLikeEvent);

      trackCleanupRef.current = () => {
        track.removeEventListener("ended", handleTrackStopLikeEvent);
        track.removeEventListener("mute", handleTrackStopLikeEvent);
      };
    }

    if (video.srcObject !== stream) {
      video.srcObject = stream;
    }

    await waitForVideoMetadata(video);

    if (video.paused) {
      try {
        await video.play();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        if (!message.includes("interrupted by a new load request")) {
          throw error;
        }
      }
    }

    await waitForVideoReady(video);
  }, [stopMonitoring]);

  const startMonitoring = useCallback(async () => {
    if (startedRef.current) return;

    startedRef.current = true;

    try {
      const currentSessionId = sessionIdRef.current || createSessionId();
      sessionIdRef.current = currentSessionId;
      setSessionId(currentSessionId);

      await startCamera();

      setIsMonitoring(true);

      await checkProctoring();

      intervalRef.current = setInterval(() => {
        checkProctoring().catch((error) => {
          logErrorOnce(error);
        });
      }, intervalMs);
    } catch (error) {
      startedRef.current = false;
      throw error;
    }
  }, [checkProctoring, intervalMs, logErrorOnce, startCamera]);

  const resetIncidents = useCallback(() => {
    setIncidents([]);
    setWarningCount(0);
  }, []);

  useEffect(() => {
    if (!autoStart) return;

    let cancelled = false;

    const init = async () => {
      try {
        if (!cancelled) {
          await startMonitoring();
        }
      } catch (error) {
        logErrorOnce(error);
      }
    };

    void init();

    return () => {
      cancelled = true;
      stopMonitoring();
    };
  }, [autoStart, logErrorOnce, startMonitoring, stopMonitoring]);

  return {
    videoRef,
    sessionId,
    lastCheckedAt,
    warningCount,
    incidents,
    isMonitoring,
    currentWarning,
    faceCount,
    startMonitoring,
    stopMonitoring,
    checkProctoring,
    resetIncidents,
  };
}
