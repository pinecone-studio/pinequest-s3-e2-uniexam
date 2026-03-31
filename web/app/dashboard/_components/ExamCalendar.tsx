"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import { isHiddenStudentExam } from "@/lib/exam-visibility";
import { cn } from "@/lib/utils";
import { graphqlRequest } from "@/lib/graphql";

interface ExamCalendarProps {
  today?: Date;
  className?: string;
}

type ExamCalendarResponse = {
  studentByEmail: {
    id: string;
  } | null;
  enrollments: {
    id: string;
    student_id: string;
    course_id: string;
  }[];
  submissions: {
    id: string;
    student_id: string;
    exam_id: string;
    status: "in_progress" | "submitted" | "reviewed" | null;
  }[];
  courses: {
    id: string;
    name: string;
    code: string;
    exams: {
      id: string;
      title: string;
      start_time: string;
      end_time: string;
      duration: number;
      type: string;
    }[];
  }[];
};

type CalendarExam = {
  id: string;
  title: string;
  courseName: string;
  courseCode: string;
  startTime: string;
  endTime: string;
  type: string;
  dateKey: string;
};

const EXAM_CALENDAR_QUERY = `
  query ExamCalendar($email: String!) {
    studentByEmail(email: $email) {
      id
    }
    enrollments {
      id
      student_id
      course_id
    }
    submissions {
      id
      student_id
      exam_id
      status
    }
    courses {
      id
      name
      code
      exams {
        id
        title
        start_time
        end_time
        duration
        type
      }
    }
  }
`;

const WEEKDAYS = ["Ня", "Да", "Мя", "Лх", "Пү", "Ба", "Бя"];
const MONTH_NAMES = [
  "1-р сар",
  "2-р сар",
  "3-р сар",
  "4-р сар",
  "5-р сар",
  "6-р сар",
  "7-р сар",
  "8-р сар",
  "9-р сар",
  "10-р сар",
  "11-р сар",
  "12-р сар",
];

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const getDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatListDate = (value: string) =>
  new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));

const formatTime = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));

const buildCalendarExams = (
  data: ExamCalendarResponse,
  studentId: string,
  today: Date,
) => {
  const enrolledCourseIds = new Set(
    data.enrollments
      .filter((enrollment) => enrollment.student_id === studentId)
      .map((enrollment) => enrollment.course_id),
  );

  const completedExamIds = new Set(
    data.submissions
      .filter(
        (submission) =>
          submission.student_id === studentId &&
          (submission.status === "submitted" ||
            submission.status === "reviewed"),
      )
      .map((submission) => submission.exam_id),
  );

  const todayStart = startOfDay(today).getTime();

  return data.courses
    .filter((course) => enrolledCourseIds.has(course.id))
    .flatMap((course) =>
      (course.exams ?? [])
        .filter((exam) => !isHiddenStudentExam(exam.title))
        .map((exam) => ({
          id: exam.id,
          title: exam.title,
          courseName: course.name,
          courseCode: course.code,
          startTime: exam.start_time,
          endTime: exam.end_time,
          type: exam.type,
          dateKey: getDateKey(new Date(exam.start_time)),
        })),
    )
    .filter((exam) => {
      const startsAt = new Date(exam.startTime).getTime();

      return (
        Number.isFinite(startsAt) &&
        startsAt >= todayStart &&
        !completedExamIds.has(exam.id)
      );
    })
    .sort(
      (left, right) =>
        new Date(left.startTime).getTime() -
        new Date(right.startTime).getTime(),
    );
};

export function ExamCalendar({
  today = new Date(),
  className,
}: ExamCalendarProps) {
  const [calendarToday] = useState(today);
  const [year, setYear] = useState<number>(calendarToday.getFullYear());
  const [month, setMonth] = useState<number>(calendarToday.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(calendarToday);
  const [exams, setExams] = useState<CalendarExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const selectedDateRef = useRef<Date | null>(calendarToday);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);

  useEffect(() => {
    let cancelled = false;

    if (!isLoaded) {
      return;
    }

    const loadExams = async () => {
      try {
        setLoading(true);
        setError(null);

        const studentEmail = user?.primaryEmailAddress?.emailAddress;

        if (!studentEmail) {
          if (cancelled) return;

          setExams([]);
          setMessage("Шалгалтын хуанли харахын тулд нэвтэрнэ үү.");
          setLoading(false);
          return;
        }

        const data = await graphqlRequest<ExamCalendarResponse>(
          EXAM_CALENDAR_QUERY,
          {
            email: studentEmail,
          },
        );

        if (cancelled) return;

        const studentId = data.studentByEmail?.id;

        if (!studentId) {
          setExams([]);
          setMessage("Одоогоор таны оюутны мэдээлэл олдсонгүй.");
          return;
        }

        const nextExams = buildCalendarExams(data, studentId, calendarToday);
        setExams(nextExams);
        setMessage(
          nextExams.length === 0 ? "Танд ойрын товлогдсон шалгалт алга." : null,
        );

        if (nextExams.length > 0) {
          const firstExamDate = new Date(nextExams[0].startTime);
          const currentSelectedDate = selectedDateRef.current;

          if (
            !currentSelectedDate ||
            !nextExams.some(
              (exam) => exam.dateKey === getDateKey(currentSelectedDate),
            )
          ) {
            setSelectedDate(firstExamDate);
            setYear(firstExamDate.getFullYear());
            setMonth(firstExamDate.getMonth());
          }
        }
      } catch (fetchError) {
        if (cancelled) return;

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Шалгалтын мэдээлэл дуудахад алдаа гарлаа.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadExams();

    return () => {
      cancelled = true;
    };
  }, [calendarToday, isLoaded, user?.primaryEmailAddress?.emailAddress]);

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const trailingDays = 42 - firstDayOfWeek - daysInMonth;

  const upcomingExams = useMemo(() => exams.slice(0, 4), [exams]);
  const hiddenUpcomingCount = exams.length - upcomingExams.length;
  const selectedDateKey = selectedDate ? getDateKey(selectedDate) : null;
  const selectedDateExams = useMemo(
    () =>
      selectedDateKey
        ? exams.filter((exam) => exam.dateKey === selectedDateKey)
        : [],
    [exams, selectedDateKey],
  );

  const isToday = (d: number) =>
    isSameDay(new Date(year, month, d), calendarToday);

  const isExam = (d: number) =>
    exams.some((exam) => exam.dateKey === getDateKey(new Date(year, month, d)));

  const isSelected = (d: number) =>
    selectedDate !== null && isSameDay(selectedDate, new Date(year, month, d));

  const handleDayClick = (d: number) => {
    const clicked = new Date(year, month, d);

    if (selectedDate && isSameDay(selectedDate, clicked)) {
      setSelectedDate(null);
      return;
    }

    setSelectedDate(clicked);
  };

  const focusExamDate = (dateValue: string) => {
    const date = new Date(dateValue);

    setYear(date.getFullYear());
    setMonth(date.getMonth());
    setSelectedDate(date);
  };

  const changeMonth = (dir: 1 | -1) => {
    let nextMonth = month + dir;
    let nextYear = year;

    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }

    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    }

    setMonth(nextMonth);
    setYear(nextYear);
  };

  return (
    <Card
      className={cn(
        "flex min-h-[320px] min-w-0 self-start flex-col overflow-hidden rounded-2xl border-white/40 bg-white/60 shadow-sm ring-1 ring-black/5 sm:min-h-[340px] lg:min-h-[360px]",
        className,
      )}
    >
      <CardHeader className="px-5">
        <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <div className="rounded-lg bg-[#e6f4f1] p-1.5 text-[#006d77]">
            <CalendarDays className="h-3.5 w-3.5" />
          </div>
          Шалгалтын хуваарь
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col px-5 pb-3">
        {loading ? (
          <div className="flex flex-1 flex-col">
            <div className="mb-3 mt-0 flex items-center justify-between">
              <Skeleton className="h-7 w-7 rounded-full bg-slate-200" />
              <Skeleton className="h-4 w-28 bg-slate-200" />
              <Skeleton className="h-7 w-7 rounded-full bg-slate-200" />
            </div>

            <div className="mb-1.5 grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }, (_, index) => (
                <Skeleton
                  key={`weekday-skeleton-${index + 1}`}
                  className="h-4 w-full bg-slate-200"
                />
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }, (_, index) => (
                <Skeleton
                  key={`day-skeleton-${index + 1}`}
                  className="mx-auto h-[26px] w-[26px] rounded-full bg-slate-200"
                />
              ))}
            </div>

            <div className="mt-3 space-y-2">
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton
                  key={`list-skeleton-${index + 1}`}
                  className="h-9 w-full rounded-lg bg-slate-200"
                />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-1 items-center">
            <div className="w-full rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
              {error}
            </div>
          </div>
        ) : (
          <>
            <div>
              <div className="mb-3 mt-0 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-400 hover:bg-[#e6f4f1]/70 hover:text-[#006d77]"
                  onClick={() => changeMonth(-1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs font-bold tracking-tight text-slate-700">
                  {year} оны {MONTH_NAMES[month]}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-400 hover:bg-[#e6f4f1]/70 hover:text-[#006d77]"
                  onClick={() => changeMonth(1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="mb-1.5 grid grid-cols-7">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="text-center text-[10px] font-bold uppercase tracking-tighter text-slate-400"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-1">
                {Array.from({ length: firstDayOfWeek }, (_, index) => (
                  <div
                    key={`prev-${index + 1}`}
                    className="flex h-[26px] items-center justify-center text-center text-[10px] text-slate-300"
                  >
                    {daysInPrevMonth - firstDayOfWeek + 1 + index}
                  </div>
                ))}

                {Array.from({ length: daysInMonth }, (_, index) => {
                  const day = index + 1;
                  const todayDay = isToday(day);
                  const examDay = isExam(day);
                  const selectedDay = isSelected(day);

                  return (
                    <div
                      key={day}
                      onClick={() => handleDayClick(day)}
                      className={cn(
                        "mx-auto flex h-[26px] w-[26px] cursor-pointer select-none items-center justify-center rounded-full text-[10px] transition-all",
                        todayDay &&
                          !selectedDay &&
                          "bg-[#006d77] font-bold text-white shadow-md shadow-[#006d77]/20",
                        examDay &&
                          !todayDay &&
                          !selectedDay &&
                          "bg-[#e6f4f1] font-bold text-[#006d77] ring-1 ring-[#006d77]/15",
                        selectedDay &&
                          !todayDay &&
                          "scale-110 bg-[#004f56] font-bold text-white ring-2 ring-[#c8e3dd]",
                        selectedDay &&
                          todayDay &&
                          "scale-110 bg-[#00565e] font-bold text-white ring-2 ring-[#b7d8d2]",
                        !todayDay &&
                          !examDay &&
                          !selectedDay &&
                          "text-slate-600 hover:bg-slate-100",
                      )}
                    >
                      {day}
                    </div>
                  );
                })}

                {Array.from({ length: trailingDays }, (_, index) => (
                  <div
                    key={`next-${index + 1}`}
                    className="flex h-[26px] items-center justify-center text-center text-[10px] text-slate-300"
                  >
                    {index + 1}
                  </div>
                ))}
              </div>

              {upcomingExams.length > 0 ? (
                <div className="mt-2.5 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Удахгүй болох
                  </p>

                  {upcomingExams.map((exam) => (
                    <button
                      key={exam.id}
                      type="button"
                      onClick={() => focusExamDate(exam.startTime)}
                      className="group flex w-full items-center justify-between rounded-lg bg-[#e6f4f1]/90 px-3 py-1.5 text-left transition-colors hover:bg-[#d7ebe6]"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-[#006d77]" />
                          <span className="text-[11px] font-semibold text-[#006d77]">
                            {formatListDate(exam.startTime)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[10px] text-slate-500">
                          {exam.courseCode} · {exam.title}
                        </p>
                      </div>

                      <span className="text-[10px] font-medium text-[#006d77]">
                        {formatTime(exam.startTime)}
                      </span>
                    </button>
                  ))}

                  {hiddenUpcomingCount > 0 ? (
                    <p className="pt-1 text-[10px] font-medium text-slate-400">
                      +{hiddenUpcomingCount} нэмэлт шалгалт байна
                    </p>
                  ) : null}
                </div>
              ) : message ? (
                <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
                  {message}
                </div>
              ) : null}
            </div>

            <div className="mt-auto pt-3">
              {selectedDate && selectedDateExams.length > 0 ? (
                <div className="rounded-2xl border border-slate-100 bg-white/60 px-3 py-2">
                  <div className="mt-2 space-y-2">
                    {selectedDateExams.map((exam) => (
                      <div
                        key={`${exam.id}-selected`}
                        className="rounded-xl bg-slate-50 px-3 py-2"
                      >
                        <p className="text-[11px] font-semibold text-slate-800">
                          {exam.title}
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-500">
                          {exam.courseName || exam.courseCode}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-[10px] text-[#006d77]">
                          <Clock3 className="h-3 w-3" />
                          <span>
                            {formatTime(exam.startTime)} -{" "}
                            {formatTime(exam.endTime)}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="flex shrink-0 items-center gap-4 border-t border-slate-100 pt-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-[#006d77]" />
                  <span className="text-[10px] font-medium text-slate-500">
                    Өнөөдөр
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-[#e6f4f1] ring-1 ring-[#006d77]/20" />
                  <span className="text-[10px] font-medium text-slate-500">
                    Шалгалттай
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-[#004f56]" />
                  <span className="text-[10px] font-medium text-slate-500">
                    Сонгосон
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
