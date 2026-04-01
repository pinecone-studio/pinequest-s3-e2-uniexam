"use client";

import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";
import { Card, CardContent } from "@/components/ui/card";

type LiveMonitorPanelProps = {
  roomId?: string;
};

export function LiveMonitorPanel({
  roomId = "exam-room-1",
}: LiveMonitorPanelProps) {
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const [status, setStatus] = useState("waiting for student...");
  const [debug, setDebug] = useState("no track yet");

  useEffect(() => {
    const socket = getSocket();

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pcRef.current = pc;

    pc.ontrack = async (event) => {
      setDebug(`track received: ${event.track.kind}`);

      const remoteStream = event.streams[0];
      if (!remoteStream) return;

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.muted = true;
        remoteVideoRef.current.playsInline = true;
        remoteVideoRef.current.autoplay = true;

        remoteVideoRef.current.onloadedmetadata = async () => {
          try {
            await remoteVideoRef.current?.play();
            setDebug("remote video playing");
          } catch (error) {
            console.error("video play error:", error);
            setDebug("video play failed");
          }
        };
      }

      event.track.onunmute = async () => {
        if (
          remoteVideoRef.current &&
          remoteVideoRef.current.srcObject !== remoteStream
        ) {
          remoteVideoRef.current.srcObject = remoteStream;
        }

        try {
          await remoteVideoRef.current?.play();
          setDebug("track unmuted and playing");
        } catch (error) {
          console.error("play after unmute failed:", error);
          setDebug("track received but play failed");
        }
      };
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          roomId,
          candidate: event.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      setStatus(`connection: ${pc.connectionState}`);
    };

    socket.emit("join-room", {
      roomId,
      role: "teacher",
    });

    socket.on("peer-joined", ({ role }) => {
      if (role === "student") {
        setStatus("student joined, requesting offer...");
        socket.emit("request-offer", { roomId });
      }
    });

    socket.on("offer", async ({ sdp }) => {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("answer", {
          roomId,
          sdp: answer,
        });

        setStatus("student stream connecting...");
      } catch (error) {
        console.error("offer handling error:", error);
        setDebug("offer handling failed");
      }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (!candidate) return;

      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    });

    socket.on("peer-left", ({ role }) => {
      if (role === "student") {
        setStatus("student disconnected");
        setDebug("student left");

        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
      }
    });

    return () => {
      socket.off("peer-joined");
      socket.off("offer");
      socket.off("ice-candidate");
      socket.off("peer-left");

      pc.close();
      pcRef.current = null;
    };
  }, [roomId]);

  return (
    <Card className="rounded-2xl border-[var(--monitoring-dark-border)] bg-white shadow-sm">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-[var(--monitoring-dark)]">
          Live camera monitoring
        </h2>
        <p className="mt-1 text-sm text-[var(--monitoring-muted)]">{status}</p>
        <p className="mb-4 text-xs text-[var(--monitoring-muted)]/80">
          {debug}
        </p>

        <div className="rounded-xl border border-[var(--monitoring-dark-border)] bg-black p-2">
          <video
            ref={remoteVideoRef}
            autoPlay
            muted
            playsInline
            controls={false}
            className="w-full max-h-[420px] rounded-lg bg-black object-contain"
          />
        </div>
      </CardContent>
    </Card>
  );
}
