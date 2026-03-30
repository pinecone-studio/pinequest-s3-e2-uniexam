import type { CSSProperties } from "react";

export const theme = {
  dark: "#0F1923",
  primary: "#00B89C",
  warning: "#F0A500",
} as const;

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const safeHex =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  const value = Number.parseInt(safeHex, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function withAlpha(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const monitoringCssVars = {
  "--monitoring-dark": theme.dark,
  "--monitoring-primary": theme.primary,
  "--monitoring-warning": theme.warning,

  "--monitoring-page-bg": withAlpha(theme.primary, 0.04),
  "--monitoring-dark-soft": withAlpha(theme.dark, 0.06),
  "--monitoring-dark-border": withAlpha(theme.dark, 0.12),
  "--monitoring-muted": withAlpha(theme.dark, 0.64),

  "--monitoring-primary-soft": withAlpha(theme.primary, 0.12),
  "--monitoring-primary-surface": withAlpha(theme.primary, 0.08),

  "--monitoring-warning-soft": withAlpha(theme.warning, 0.14),
  "--monitoring-warning-surface": withAlpha(theme.warning, 0.1),
  "--monitoring-warning-surface-strong": withAlpha(theme.warning, 0.16),
  "--monitoring-warning-border": withAlpha(theme.warning, 0.32),
} as CSSProperties;
