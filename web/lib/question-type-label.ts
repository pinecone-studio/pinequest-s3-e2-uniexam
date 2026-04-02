export const getQuestionTypeLabel = (value: string | null | undefined) => {
  const normalized = value?.trim().toLowerCase() ?? "";

  if (
    normalized.includes("short") ||
    normalized.includes("essay") ||
    normalized.includes("text") ||
    normalized.includes("open")
  ) {
    return "Задгай асуулт";
  }

  if (
    normalized.includes("multiple") ||
    normalized.includes("choice") ||
    normalized.includes("select") ||
    normalized.includes("mcq")
  ) {
    return "Сонголттой";
  }

  if (normalized.includes("true") || normalized.includes("false")) {
    return "Үнэн / Худал";
  }

  if (normalized.includes("fill")) {
    return "Нөхөх";
  }

  return value?.trim() || "Тодорхойгүй";
};
