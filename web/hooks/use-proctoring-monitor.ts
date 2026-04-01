"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import {
  createProctorDetector,
  type ProctorFrameState,
} from "@/lib/face-detector";

export type UseProctorMonitorReturn = {
  videoRef: RefObject<HTMLVideoElement | null>;
  streamRef: RefObject<MediaStream | null>;
  isReady: boolean;
  error: string;
  state: ProctorFrameState;
};

const INITIAL_STATE: ProctorFrameState = {
  peopleCount: 0,
  headPose: "no-face",
  yaw: 0,
  pitch: 0,
  phoneVisible: false,
  phoneScore: 0,
  suspicious: false,
};

export function useProctorMonitor(): UseProctorMonitorReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState("");
  const [state, setState] = useState<ProctorFrameState>(INITIAL_STATE);

  useEffect(() => {
    let isCancelled = false;
    let rafId = 0;
    let stream: MediaStream | null = null;
    let detector: Awaited<ReturnType<typeof createProctorDetector>> | null =
      null;

    let downCounter = 0;
    let phoneCounter = 0;
    let lastVideoTime = -1;

    async function waitForVideoData(video: HTMLVideoElement) {
      if (
        video.readyState >= 2 &&
        video.videoWidth > 0 &&
        video.videoHeight > 0
      ) {
        return;
      }

      await new Promise<void>((resolve, reject) => {
        const onLoadedData = () => {
          cleanup();
          resolve();
        };

        const onError = () => {
          cleanup();
          reject(new Error("Video data failed to load"));
        };

        const cleanup = () => {
          video.removeEventListener("loadeddata", onLoadedData);
          video.removeEventListener("error", onError);
        };

        video.addEventListener("loadeddata", onLoadedData, { once: true });
        video.addEventListener("error", onError, { once: true });
      });
    }

    async function start() {
      try {
        const video = videoRef.current;
        if (!video) return;

        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });

        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        video.srcObject = stream;

        await waitForVideoData(video);
        await video.play();

        detector = await createProctorDetector();

        if (isCancelled) {
          detector.dispose();
          return;
        }

        setIsReady(true);
        setError("");

        const loop = () => {
          if (isCancelled || !detector) return;

          const videoEl = videoRef.current;
          if (!videoEl) return;

          if (
            videoEl.readyState < 2 ||
            !videoEl.videoWidth ||
            !videoEl.videoHeight
          ) {
            rafId = requestAnimationFrame(loop);
            return;
          }

          if (videoEl.currentTime === lastVideoTime) {
            rafId = requestAnimationFrame(loop);
            return;
          }

          lastVideoTime = videoEl.currentTime;

          let rawState: ProctorFrameState;

          try {
            rawState = detector.processFrame(
              videoEl,
              videoEl.currentTime * 1000,
            );
          } catch (err) {
            console.error("processFrame failed", err);
            setError("Frame processing failed");
            rafId = requestAnimationFrame(loop);
            return;
          }

          if (rawState.headPose === "down") downCounter += 1;
          else downCounter = 0;

          if (rawState.phoneVisible) phoneCounter += 1;
          else phoneCounter = 0;

          const stableState: ProctorFrameState = {
            ...rawState,
            headPose:
              downCounter >= 3
                ? "down"
                : rawState.headPose === "down"
                  ? "forward"
                  : rawState.headPose,
            phoneVisible: phoneCounter >= 2,
            suspicious:
              rawState.peopleCount !== 1 ||
              downCounter >= 3 ||
              phoneCounter >= 2,
          };

          setState(stableState);
          rafId = requestAnimationFrame(loop);
        };

        rafId = requestAnimationFrame(loop);
      } catch (err) {
        console.error(err);
        if (!isCancelled) {
          setError("Camera or MediaPipe initialization failed");
          setIsReady(false);
        }
      }
    }

    void start();

    return () => {
      isCancelled = true;
      cancelAnimationFrame(rafId);

      detector?.dispose();

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      streamRef.current = null;
    };
  }, []);

  return {
    videoRef,
    streamRef,
    isReady,
    error,
    state,
  };
}
