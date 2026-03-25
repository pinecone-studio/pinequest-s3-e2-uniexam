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

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [handleViolation]);
}
