"use client";

import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";

const ROOM_ID = "exam-room-1";

export default function TeacherPage() {
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
      console.log("ontrack fired", event);
      console.log("track kind:", event.track.kind);
      console.log("streams:", event.streams);

      setDebug(`track received: ${event.track.kind}`);

      const remoteStream = event.streams[0];

      if (!remoteStream) {
        console.log("no remote stream in event.streams[0]");
        return;
      }

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.muted = true;
        remoteVideoRef.current.playsInline = true;
        remoteVideoRef.current.autoplay = true;

        remoteVideoRef.current.onloadedmetadata = async () => {
          try {
            await remoteVideoRef.current?.play();
            console.log("remote video playing");
            setDebug("remote video playing");
          } catch (error) {
            console.error("video play error:", error);
            setDebug("video play failed");
          }
        };
      }

      event.track.onunmute = async () => {
        console.log("remote track unmuted");

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
        console.log("sending ice candidate");
        socket.emit("ice-candidate", {
          roomId: ROOM_ID,
          candidate: event.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("connection state:", pc.connectionState);
      setStatus(`connection: ${pc.connectionState}`);
    };

    pc.oniceconnectionstatechange = () => {
      console.log("ice connection state:", pc.iceConnectionState);
    };

    socket.emit("join-room", {
      roomId: ROOM_ID,
      role: "teacher",
    });

    socket.on("peer-joined", ({ role }) => {
      console.log("peer joined:", role);

      if (role === "student") {
        setStatus("student joined, requesting offer...");
        socket.emit("request-offer", { roomId: ROOM_ID });
      }
    });

    socket.on("offer", async ({ sdp }) => {
      console.log("offer received");

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        console.log("remote description set");

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("answer", {
          roomId: ROOM_ID,
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
        console.log("ice candidate received");
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    });

    socket.on("peer-left", ({ role }) => {
      console.log("peer left:", role);

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
    };
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6">
      <h1 className="text-2xl font-semibold mb-2">Teacher Monitoring</h1>
      <p className="text-sm text-zinc-400">{status}</p>
      <p className="mb-4 text-xs text-zinc-500">{debug}</p>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <video
          ref={remoteVideoRef}
          autoPlay
          muted
          playsInline
          controls={false}
          className="w-full max-w-3xl rounded-xl bg-black"
        />
      </div>
    </main>
  );
}
