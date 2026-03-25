"use client";

import { useCallback, useEffect, useRef } from "react";

type UseExamGuardOptions = {
  maxWarnings?: number;
  onMaxWarnings?: () => void;
};

/**
 * Anti-cheat listeners for the exam typing area: tab/visibility, blur, shortcuts, context menu.
 */
export function useExamGuard(
  onViolation: (type: string) => void,
  options?: UseExamGuardOptions,
) {
  const maxWarnings = options?.maxWarnings ?? 3;
  const onMaxWarnings = options?.onMaxWarnings;
  const violationCountRef = useRef(0);
  const maxFiredRef = useRef(false);

  const handleViolation = useCallback(
    (type: string) => {
      onViolation(type);
      violationCountRef.current += 1;
      if (
        violationCountRef.current >= maxWarnings &&
        onMaxWarnings &&
        !maxFiredRef.current
      ) {
        maxFiredRef.current = true;
        onMaxWarnings();
      }
    },
    [onViolation, maxWarnings, onMaxWarnings],
  );

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) handleViolation("Tab Switched / Hidden");
    };

    const handleBlur = () => handleViolation("Window Lost Focus");

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore lone modifier keydowns (avoids false positives on Ctrl/Alt/Meta/Shift).
      if (
        e.key === "Control" ||
        e.key === "Alt" ||
        e.key === "Meta" ||
        e.key === "Shift"
      ) {
        return;
      }

      if (
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        e.key === "PrintScreen" ||
        e.key === "F12"
      ) {
        e.preventDefault();
        handleViolation(`Shortcut detected: ${e.key}`);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [handleViolation]);
}
