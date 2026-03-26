"use client";

import { useProctorMonitor } from "@/hooks/use-proctoring-monitor";
import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";

export function ProctoringGuard() {
  const { videoRef, isReady, error, state } = useProctorMonitor();

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

    // same warning давтаж битгий spam хий
    if (
      signature === lastToastRef.current &&
      now - lastToastTimeRef.current < 4000
    ) {
      return;
    }

    lastToastRef.current = signature;
    lastToastTimeRef.current = now;

    const severe =
      flags.includes("Олон хүн илэрсэн") ||
      flags.includes("Царай харагдахгүй байна");

    const title = severe ? "Сэжигтэй үйлдэл илэрсэн" : "Анхааруулга";
    const description = flags.join(", ");

    if (severe) {
      toast.error(title, {
        description,
        duration: 3000,
      });
    } else {
      toast.warning(title, {
        description,
        duration: 2500,
      });
    }
  }, [flags, isReady, error]);

  useEffect(() => {
    if (!error) return;

    toast.error("Proctoring unavailable", {
      description: error,
      duration: 3000,
    });
  }, [error]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className="absolute -left-[9999px] top-0 h-px w-px opacity-0 pointer-events-none"
    />
  );
}
