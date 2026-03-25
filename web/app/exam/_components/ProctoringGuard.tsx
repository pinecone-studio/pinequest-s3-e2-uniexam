"use client";

import { useProctoringMonitor } from "@/hooks/use-proctoring-monitor";

function getWarningMessage(warning: "NO_FACE" | "MULTIPLE_FACES" | null) {
  if (warning === "NO_FACE") {
    return "Таны царай камер дээр харагдахгүй байна.";
  }

  if (warning === "MULTIPLE_FACES") {
    return "Камер дээр 2 ба түүнээс олон хүн илэрлээ.";
  }

  return "";
}

export default function ProctoringGuard() {
  const { videoRef, currentWarning } = useProctoringMonitor({
    intervalMs: 10000,
    autoStart: true,
  });

  return (
    <>
      {currentWarning ? (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-lg">
          {getWarningMessage(currentWarning)}
        </div>
      ) : null}

      {/* Hidden video for camera monitoring only */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="pointer-events-none absolute left-[-9999px] top-0 h-px w-px opacity-0"
      />
    </>
  );
}
