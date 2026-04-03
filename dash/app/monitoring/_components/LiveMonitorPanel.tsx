"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type ConnectionStateLabel =
  | "new"
  | "connecting"
  | "connected"
  | "disconnected"
  | "failed"
  | "closed";

type StudentTile = {
  peerId: string;
  roomId: string;
  stream: MediaStream | null;
  connectionState: ConnectionStateLabel;
  debug: string;
  latestWarning?: LiveWarning;
};

type PeerConnectionEntry = {
  pc: RTCPeerConnection;
  stream: MediaStream | null;
};

type PeerJoinedPayload = {
  role?: "teacher" | "student";
  socketId?: string;
  roomId?: string;
};

type OfferPayload = {
  sdp?: RTCSessionDescriptionInit;
  from?: string;
  roomId?: string;
};

type IceCandidatePayload = {
  candidate?: RTCIceCandidateInit;
  from?: string;
  roomId?: string;
};

type PeerLeftPayload = {
  role?: "teacher" | "student";
  socketId?: string;
  roomId?: string;
};

type LiveMonitorPanelProps = {
  roomIds?: string[];
};

type WarningSeverity = "warning" | "danger";

type LiveWarningPayload = {
  roomId?: string;
  socketId?: string;
  from?: string;
  studentId?: string | number;
  studentName?: string;
  warningCode?: string;
  type?: string;
  message?: string;
  severity?: WarningSeverity | string | number;
  createdAt?: string;
  timestamp?: string | number;
};

type LiveWarning = {
  id: string;
  peerId: string;
  roomId: string;
  message: string;
  severity: WarningSeverity;
  typeLabel: string;
  createdAt: string;
};

const LIVE_WARNING_EVENTS = [
  "proctor-alert",
  "proctor-warning",
  "student-warning",
  "exam-warning",
  "warning-event",
] as const;

const toWarningSeverity = (
  value: LiveWarningPayload["severity"],
): WarningSeverity => {
  if (typeof value === "number") {
    return value >= 2 ? "danger" : "warning";
  }
  const normalized = String(value ?? "").toLowerCase();
  return normalized.includes("danger") || normalized.includes("high")
    ? "danger"
    : "warning";
};

const toWarningTypeLabel = (payload: LiveWarningPayload) => {
  const rawType = String(payload.type ?? payload.warningCode ?? "").replaceAll(
    /[_-]+/g,
    " ",
  );
  const normalized = rawType.trim();
  return normalized ? normalized : "warning";
};

const toWarningMessage = (payload: LiveWarningPayload) => {
  const message = payload.message?.trim();
  if (message) return message;
  return `Detected ${toWarningTypeLabel(payload)}`;
};

const toWarningTimestamp = (payload: LiveWarningPayload) => {
  const raw = payload.createdAt ?? payload.timestamp;
  if (typeof raw === "number") {
    return new Date(raw).toISOString();
  }
  if (typeof raw === "string") {
    const timestamp = new Date(raw).getTime();
    if (Number.isFinite(timestamp)) {
      return new Date(timestamp).toISOString();
    }
  }
  return new Date().toISOString();
};

function StudentStreamTile({
  tile,
}: {
  tile: StudentTile;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!tile?.stream) {
      video.srcObject = null;
      return;
    }

    video.srcObject = tile.stream;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;

    const tryPlay = async () => {
      try {
        await video.play();
      } catch (error) {
        console.error("video play error:", error);
      }
    };

    void tryPlay();
  }, [tile?.stream]);

  const title = `Student ${tile.peerId.slice(0, 6)}`;
  const subtitle = `${tile.connectionState} - ${tile.roomId.replace("exam-room-", "")}`;

  return (
    <div className="rounded-xl border border-[var(--monitoring-dark-border)] bg-black/95 p-2">
      <div className="mb-2 flex items-center justify-between gap-2 text-xs">
        <p className="truncate font-medium text-white/90">{title}</p>
        <div className="flex items-center gap-2">
          {tile.latestWarning ? (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                tile.latestWarning.severity === "danger"
                  ? "bg-red-500/20 text-red-300"
                  : "bg-amber-500/20 text-amber-200"
              }`}
            >
              {tile.latestWarning.typeLabel}
            </span>
          ) : null}
          <p
            className={`truncate ${
              tile?.connectionState === "connected"
                ? "text-emerald-300"
                : "text-white/60"
            }`}
          >
            {subtitle}
          </p>
        </div>
      </div>

      <div className="relative aspect-video rounded-lg bg-black">
        {tile.stream ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            controls={false}
            className="h-full w-full rounded-lg bg-black object-contain"
          />
        ) : (
          <div className="h-full w-full p-3">
            <Skeleton className="h-full w-full rounded-md bg-white/10" />
          </div>
        )}
      </div>

      <p className="mt-2 truncate text-[11px] text-white/50">
        {tile.debug ?? "No signaling event yet"}
      </p>
      {tile.latestWarning ? (
        <p className="mt-1 truncate text-[11px] text-amber-200/90">
          {tile.latestWarning.message}
        </p>
      ) : null}
    </div>
  );
}

export function LiveMonitorPanel({
  roomIds,
}: LiveMonitorPanelProps) {
  const peersRef = useRef<Map<string, PeerConnectionEntry>>(new Map());
  const pendingIceRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const peerRoomRef = useRef<Map<string, string>>(new Map());
  const [tiles, setTiles] = useState<StudentTile[]>([]);
  const [status, setStatus] = useState("Waiting for students...");
  const [panelDebug, setPanelDebug] = useState("No signaling event yet");
  const [recentWarnings, setRecentWarnings] = useState<LiveWarning[]>([]);
  const normalizedRoomIds = useMemo(() => {
    const raw = roomIds ?? [];
    return Array.from(new Set(raw.filter(Boolean)));
  }, [roomIds]);

  useEffect(() => {
    setTiles([]);
    setRecentWarnings([]);

    if (normalizedRoomIds.length === 0) {
      setStatus("No live exam rooms");
      setPanelDebug("No room selected");
      return;
    }

    const socket = getSocket();

    const upsertTile = (
      peerId: string,
      fallbackRoomId: string,
      patch: Partial<StudentTile>,
    ) => {
      setTiles((prev) => {
        const index = prev.findIndex((tile) => tile.peerId === peerId);
        if (index >= 0) {
          const next = [...prev];
          next[index] = { ...next[index], ...patch };
          return next;
        }

        return [
          ...prev,
          {
            peerId,
            roomId: fallbackRoomId,
            stream: null,
            connectionState: "new",
            debug: "peer discovered",
            ...patch,
          },
        ];
      });
    };

    const removePeer = (peerId: string) => {
      const entry = peersRef.current.get(peerId);
      if (entry) {
        entry.pc.close();
        peersRef.current.delete(peerId);
      }
      peerRoomRef.current.delete(peerId);
      pendingIceRef.current.delete(peerId);
      setTiles((prev) => prev.filter((tile) => tile.peerId !== peerId));
    };

    const getOrCreatePeerConnection = (peerId: string, nextRoomId: string) => {
      const existing = peersRef.current.get(peerId);
      if (existing) return existing.pc;

      peerRoomRef.current.set(peerId, nextRoomId);
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      pc.ontrack = (event) => {
        const stream =
          event.streams[0] ??
          (() => {
            const manualStream = new MediaStream();
            manualStream.addTrack(event.track);
            return manualStream;
          })();

        const entry = peersRef.current.get(peerId);
        if (entry) {
          entry.stream = stream;
        }

        upsertTile(peerId, nextRoomId, {
          stream,
          debug: `track received: ${event.track.kind}`,
        });
      };

      pc.onicecandidate = (event) => {
        if (!event.candidate) return;
        const signalRoomId = peerRoomRef.current.get(peerId) ?? nextRoomId;
        socket.emit("ice-candidate", {
          roomId: signalRoomId,
          candidate: event.candidate,
          to: peerId,
        });
      };

      pc.onconnectionstatechange = () => {
        upsertTile(peerId, nextRoomId, {
          connectionState: pc.connectionState,
          debug: `connection ${pc.connectionState}`,
        });
      };

      peersRef.current.set(peerId, { pc, stream: null });
      upsertTile(peerId, nextRoomId, {
        connectionState: "new",
        debug: "peer connection created",
      });

      return pc;
    };

    const resolvePeerIdFromWarning = (payload: LiveWarningPayload) => {
      if (payload.socketId) return payload.socketId;
      if (payload.from) return payload.from;

      if (payload.roomId) {
        const roomPeers = Array.from(peerRoomRef.current.entries()).filter(
          ([, roomId]) => roomId === payload.roomId,
        );
        if (roomPeers.length === 1) {
          return roomPeers[0][0];
        }
      }

      return null;
    };

    const handleLiveWarning = (payload: LiveWarningPayload) => {
      const peerId = resolvePeerIdFromWarning(payload);
      const roomId =
        payload.roomId ??
        (peerId ? peerRoomRef.current.get(peerId) : undefined);

      if (!roomId || !normalizedRoomIds.includes(roomId) || !peerId) {
        return;
      }

      const warning: LiveWarning = {
        id: `${peerId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        peerId,
        roomId,
        message: toWarningMessage(payload),
        severity: toWarningSeverity(payload.severity),
        typeLabel: toWarningTypeLabel(payload),
        createdAt: toWarningTimestamp(payload),
      };

      upsertTile(peerId, roomId, {
        latestWarning: warning,
        debug: `warning: ${warning.typeLabel}`,
      });
      setRecentWarnings((prev) => [warning, ...prev].slice(0, 20));
      setPanelDebug(`Live warning: ${warning.typeLabel}`);
    };

    const flushPendingIce = async (peerId: string) => {
      const pending = pendingIceRef.current.get(peerId);
      if (!pending || pending.length === 0) return;
      const entry = peersRef.current.get(peerId);
      if (!entry) return;

      for (const candidate of pending) {
        try {
          await entry.pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error("Error applying queued ICE candidate:", error);
        }
      }

      pendingIceRef.current.delete(peerId);
    };

    for (const nextRoomId of normalizedRoomIds) {
      socket.emit("join-room", {
        roomId: nextRoomId,
        role: "teacher",
      });
    }

    socket.on("peer-joined", ({ role, socketId, roomId: joinedRoomId }: PeerJoinedPayload) => {
      if (role === "student" && socketId && joinedRoomId) {
        if (!normalizedRoomIds.includes(joinedRoomId)) return;
        peerRoomRef.current.set(socketId, joinedRoomId);
        setStatus("Student joined. Waiting for offer...");
        setPanelDebug("Student joined and offer requested");
        socket.emit("request-offer", { roomId: joinedRoomId, to: socketId });
      }
    });

    socket.on("offer", async ({ sdp, from, roomId: offeredRoomId }: OfferPayload) => {
      if (!sdp || !from) return;
      const resolvedRoomId =
        offeredRoomId ??
        peerRoomRef.current.get(from);
      if (!resolvedRoomId || !normalizedRoomIds.includes(resolvedRoomId)) return;
      peerRoomRef.current.set(from, resolvedRoomId);

      try {
        const pc = getOrCreatePeerConnection(from, resolvedRoomId);
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        await flushPendingIce(from);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("answer", {
          roomId: resolvedRoomId,
          sdp: answer,
          to: from,
        });

        upsertTile(from, resolvedRoomId, {
          connectionState: "connecting",
          debug: "offer accepted and answer sent",
        });
        setStatus("Connecting student streams...");
        setPanelDebug("Offer handled successfully");
      } catch (error) {
        console.error("offer handling error:", error);
        upsertTile(from, resolvedRoomId, {
          connectionState: "failed",
          debug: "offer handling failed",
        });
        setPanelDebug("Offer handling failed");
      }
    });

    socket.on("ice-candidate", async ({ candidate, from, roomId: candidateRoomId }: IceCandidatePayload) => {
      if (!candidate || !from) return;
      const resolvedRoomId =
        candidateRoomId ??
        peerRoomRef.current.get(from);
      if (!resolvedRoomId || !normalizedRoomIds.includes(resolvedRoomId)) return;
      peerRoomRef.current.set(from, resolvedRoomId);

      const entry = peersRef.current.get(from);
      if (!entry || !entry.pc.remoteDescription) {
        const queued = pendingIceRef.current.get(from) ?? [];
        queued.push(candidate);
        pendingIceRef.current.set(from, queued);
        upsertTile(from, resolvedRoomId, {
          debug: `queued ICE candidate (${queued.length})`,
        });
        return;
      }

      try {
        await entry.pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    });

    socket.on("peer-left", ({ role, socketId, roomId: leftRoomId }: PeerLeftPayload) => {
      if (role === "student") {
        if (leftRoomId && !normalizedRoomIds.includes(leftRoomId)) return;
        if (socketId) {
          removePeer(socketId);
        }
        setStatus("Student disconnected");
        setPanelDebug("A student left the room");
      }
    });

    for (const eventName of LIVE_WARNING_EVENTS) {
      socket.on(eventName, handleLiveWarning);
    }

    return () => {
      socket.off("peer-joined");
      socket.off("offer");
      socket.off("ice-candidate");
      socket.off("peer-left");
      for (const eventName of LIVE_WARNING_EVENTS) {
        socket.off(eventName, handleLiveWarning);
      }

      for (const [, entry] of peersRef.current) {
        entry.pc.close();
      }
      peersRef.current.clear();
      peerRoomRef.current.clear();
      pendingIceRef.current.clear();
      setTiles([]);
    };
  }, [normalizedRoomIds]);

  const connectedCount = useMemo(
    () =>
      tiles.filter((tile) => tile.connectionState === "connected").length,
    [tiles],
  );

  const visibleTiles = useMemo(() => {
    return [...tiles].sort((a, b) => a.roomId.localeCompare(b.roomId));
  }, [tiles]);

  return (
    <Card className="rounded-2xl border-[var(--monitoring-dark-border)] bg-white shadow-sm">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-[var(--monitoring-dark)]">
          Live camera monitoring
        </h2>
        <p className="mt-1 text-sm text-[var(--monitoring-muted)]">
          {status} - connected {connectedCount}/{visibleTiles.length || 0} - rooms{" "}
          {normalizedRoomIds.length}
        </p>
        <p className="mb-4 text-xs text-[var(--monitoring-muted)]/80">
          {panelDebug}
        </p>

        {visibleTiles.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--monitoring-dark-border)] bg-[var(--monitoring-primary-surface)] px-4 py-6 text-center text-sm text-[var(--monitoring-muted)]">
            Одоогоор live stream холбогдоогүй байна.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {visibleTiles.map((tile) => (
              <StudentStreamTile key={tile.peerId} tile={tile} />
            ))}
          </div>
        )}

        {recentWarnings.length > 0 ? (
          <div className="mt-4 rounded-xl border border-[var(--monitoring-dark-border)] bg-[var(--monitoring-primary-surface)] p-3">
            <p className="mb-2 text-xs font-medium text-[var(--monitoring-muted)]">
              Live warnings ({recentWarnings.length})
            </p>
            <div className="space-y-1">
              {recentWarnings.slice(0, 8).map((warning) => (
                <div
                  key={warning.id}
                  className="flex items-center justify-between gap-2 rounded-md bg-white px-2 py-1 text-xs"
                >
                  <p className="truncate text-[var(--monitoring-dark)]">
                    {warning.message}
                  </p>
                  <p
                    className={`shrink-0 font-medium ${
                      warning.severity === "danger"
                        ? "text-[var(--monitoring-warning)]"
                        : "text-[var(--monitoring-primary)]"
                    }`}
                  >
                    {warning.typeLabel}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
