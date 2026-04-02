const DEFAULT_EXAM_RETURN_TO = "/exams";

type SearchParamsLike = {
  get: (name: string) => string | null;
};

export const getSafeExamReturnTo = (
  value: string | null | undefined,
) => {
  const normalized = value?.trim();

  if (!normalized || !normalized.startsWith("/") || normalized.startsWith("//")) {
    return DEFAULT_EXAM_RETURN_TO;
  }

  return normalized;
};

export const getExamReturnToFromSearchParams = (
  searchParams: SearchParamsLike,
) => getSafeExamReturnTo(searchParams.get("returnTo"));

export const buildExamHref = (
  examId: string,
  returnTo: string = DEFAULT_EXAM_RETURN_TO,
) => {
  const params = new URLSearchParams({
    examId,
    returnTo: getSafeExamReturnTo(returnTo),
  });

  return `/exam?${params.toString()}`;
};

export { DEFAULT_EXAM_RETURN_TO };
