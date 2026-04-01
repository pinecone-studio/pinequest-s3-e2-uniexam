"use client";

import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";
import { useProctorMonitor } from "@/hooks/use-proctoring-monitor";
import { ProctoringWarnings } from "@/app/exam/_components/ProctoringGuard";

const ROOM_ID = "exam-room-1";

export default function StudentPage() {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [status, setStatus] = useState("initializing...");

  const monitor = useProctorMonitor();

  useEffect(() => {
    if (!monitor.isReady || !monitor.streamRef.current) {
      if (monitor.error) setStatus("camera access failed");
      return;
    }

    const socket = getSocket();

    const createAndSendOffer = async () => {
      if (!pcRef.current) return;

      try {
        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);

        socket.emit("offer", {
          roomId: ROOM_ID,
          sdp: offer,
        });

        setStatus("offer sent");
      } catch (error) {
        console.error("offer error:", error);
      }
    };

    const createPeerConnection = () => {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            roomId: ROOM_ID,
            candidate: event.candidate,
          });
        }
      };

      pc.onconnectionstatechange = () => {
        setStatus(`connection: ${pc.connectionState}`);
      };

      pcRef.current = pc;
      return pc;
    };

    const start = async () => {
      try {
        const stream = monitor.streamRef.current;
        if (!stream) {
          setStatus("camera stream not ready");
          return;
        }

        const pc = createPeerConnection();

        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        socket.emit("join-room", {
          roomId: ROOM_ID,
          role: "student",
        });

        setStatus("waiting for teacher...");
      } catch (error) {
        console.error(error);
        setStatus("camera access failed");
      }
    };

    socket.on("peer-joined", async ({ role }) => {
      if (role === "teacher") {
        await createAndSendOffer();
      }
    });

    socket.on("request-offer", async () => {
      await createAndSendOffer();
    });

    socket.on("answer", async ({ sdp }) => {
      if (!pcRef.current) return;

      try {
        await pcRef.current.setRemoteDescription(
          new RTCSessionDescription(sdp),
        );
        setStatus("teacher connected");
      } catch (error) {
        console.error(error);
      }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (!pcRef.current || !candidate) return;

      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    });

    void start();

    return () => {
      socket.off("peer-joined");
      socket.off("request-offer");
      socket.off("answer");
      socket.off("ice-candidate");

      pcRef.current?.close();
      pcRef.current = null;
    };
  }, [monitor.isReady, monitor.error, monitor.streamRef]);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-semibold mb-4">Student Camera</h1>
      <p className="mb-4 text-sm text-zinc-300">{status}</p>

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
        className="w-full max-w-xl rounded-xl border border-zinc-700 bg-zinc-900"
      />
    </main>
  );
}
