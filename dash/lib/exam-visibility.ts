const HIDDEN_EXAM_TITLE_PATTERNS = ["warmup mock"];

export const isHiddenDashboardExam = (title: string | null | undefined) => {
  const normalized = title?.trim().toLowerCase() ?? "";

  if (!normalized) {
    return false;
  }

  return HIDDEN_EXAM_TITLE_PATTERNS.some((pattern) =>
    normalized.includes(pattern),
  );
};
