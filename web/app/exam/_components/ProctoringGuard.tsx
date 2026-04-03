"use client";

import {
  useProctorMonitor,
  type UseProctorMonitorReturn,
} from "@/hooks/use-proctoring-monitor";
import { getSocket } from "@/lib/socket";
import { useEffect, useMemo, useRef } from "react";
import { useExamState } from "../_hooks/use-exam-states";
import {
  EXAM_WARNING_CODES,
  useExamWarningTracker,
} from "../_hooks/use-exam-warning-tracker";

type ProctoringWarningsProps = Pick<
  UseProctorMonitorReturn,
  "isReady" | "error" | "state"
>;

export function ProctoringWarnings({
  isReady,
  error,
  state,
}: ProctoringWarningsProps) {
  const { recordWarning } = useExamWarningTracker();

  const flags = useMemo(() => {
    const next: string[] = [];

    if (state.peopleCount > 1) next.push("Олон хүн илэрсэн");
    if (state.peopleCount === 0 || state.headPose === "no-face") {
      next.push("Царай харагдахгүй байна");
    }
    if (state.headPose === "down") next.push("Доош харж байна");
    if (state.phoneVisible) next.push("Утас харагдаж байна");

    return next;
  }, [state.peopleCount, state.headPose, state.phoneVisible]);

  const lastToastRef = useRef<string>("");
  const lastToastTimeRef = useRef(0);

  useEffect(() => {
    if (!isReady || error) return;
    if (flags.length === 0) return;

    const now = Date.now();
    const signature = flags.join("|");

    if (
      signature === lastToastRef.current &&
      now - lastToastTimeRef.current < 4000
    ) {
      return;
    }

    lastToastRef.current = signature;
    lastToastTimeRef.current = now;

    if (flags.includes("Олон хүн илэрсэн")) {
      recordWarning(EXAM_WARNING_CODES.proctorMultiplePeople, {
        message: "Multiple faces detected",
        severity: "danger",
      });
    }
    if (flags.includes("Царай харагдахгүй байна")) {
      recordWarning(EXAM_WARNING_CODES.proctorFaceMissing, {
        message: "Face is not visible",
      });
    }
    if (flags.includes("Доош харж байна")) {
      recordWarning(EXAM_WARNING_CODES.proctorLookingDown, {
        message: "Student looked away/down",
      });
    }
    if (flags.includes("Утас харагдаж байна")) {
      recordWarning(EXAM_WARNING_CODES.proctorPhoneVisible, {
        message: "Phone detected",
        severity: "danger",
      });
    }

  }, [error, flags, isReady, recordWarning]);

  useEffect(() => {
    if (!error) return;

    recordWarning(EXAM_WARNING_CODES.proctorUnavailable, {
      message: "Proctoring camera unavailable",
      severity: "danger",
    });

  }, [error, recordWarning]);

  return null;
}

export function ProctoringGuard() {
  const { exam } = useExamState();
  const monitor = useProctorMonitor();
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const teacherPeerIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (monitor.error) return;
    if (!monitor.isReady || !monitor.streamRef.current) return;

    const roomId = `exam-room-${exam.id}`;
    const socket = getSocket();
    const stream = monitor.streamRef.current;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pcRef.current = pc;

    const createAndSendOffer = async (targetPeerId?: string) => {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("offer", {
          roomId,
          sdp: offer,
          to: targetPeerId,
        });
      } catch (error) {
        console.error("offer error:", error);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          roomId,
          candidate: event.candidate,
          to: teacherPeerIdRef.current ?? undefined,
        });
      }
    };

    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    socket.emit("join-room", {
      roomId,
      role: "student",
    });

    socket.on("peer-joined", async ({ role, socketId }) => {
      if (role === "teacher" && socketId) {
        teacherPeerIdRef.current = socketId;
        await createAndSendOffer(socketId);
      }
    });

    socket.on("request-offer", async ({ from }) => {
      if (!from) return;
      teacherPeerIdRef.current = from;
      await createAndSendOffer(from);
    });

    socket.on("answer", async ({ sdp, from }) => {
      if (!sdp) return;
      if (teacherPeerIdRef.current && from && teacherPeerIdRef.current !== from) {
        return;
      }
      if (from && !teacherPeerIdRef.current) {
        teacherPeerIdRef.current = from;
      }

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      } catch (error) {
        console.error("setRemoteDescription error:", error);
      }
    });

    socket.on("ice-candidate", async ({ candidate, from }) => {
      if (!candidate) return;
      if (teacherPeerIdRef.current && from && teacherPeerIdRef.current !== from) {
        return;
      }

      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("addIceCandidate error:", error);
      }
    });

    return () => {
      socket.off("peer-joined");
      socket.off("request-offer");
      socket.off("answer");
      socket.off("ice-candidate");

      pc.close();
      pcRef.current = null;
      teacherPeerIdRef.current = null;
    };
  }, [exam.id, monitor.error, monitor.isReady, monitor.streamRef]);

  return (
    <>
      <ProctoringWarnings
        isReady={monitor.isReady}
        error={monitor.error}
        state={monitor.state}
      />
      <video
        ref={monitor.videoRef}
        autoPlay
        muted
        playsInline
        className="absolute -left-[9999px] top-0 h-px w-px opacity-0 pointer-events-none"
      />
    </>
  );
}
