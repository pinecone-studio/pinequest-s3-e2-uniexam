"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
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

const isTomorrow = (date: Date, baseDate: Date) => {
  const tomorrow = startOfDay(baseDate);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return isSameDay(date, tomorrow);
};

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

const getUpcomingExamDateLabel = (value: string, baseDate: Date) => {
  const examDate = new Date(value);

  if (Number.isNaN(examDate.getTime())) {
    return "Тов тодорхойгүй";
  }

  if (isTomorrow(examDate, baseDate)) {
    return "Маргааш шалгалттай";
  }

  return formatListDate(value);
};

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
  const hasStudentEnrollments = enrolledCourseIds.size > 0;

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
    .filter((course) =>
      hasStudentEnrollments ? enrolledCourseIds.has(course.id) : true,
    )
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
  const { user, isLoaded } = useUser();

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

  const isTodayDate = (date: Date) => isSameDay(date, calendarToday);

  const hasExamOnDate = (date: Date) =>
    exams.some((exam) => exam.dateKey === getDateKey(date));

  const isSelectedDate = (date: Date) =>
    selectedDate !== null && isSameDay(selectedDate, date);

  const handleDayClick = (clicked: Date) => {
    if (clicked.getMonth() !== month || clicked.getFullYear() !== year) {
      setMonth(clicked.getMonth());
      setYear(clicked.getFullYear());
    }

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
        "flex min-h-[286px] min-w-0 w-full self-start flex-col overflow-hidden rounded-2xl border-white/40 bg-white/60 ring-1 ring-black/8 sm:min-h-[300px] lg:min-h-[320px] lg:max-w-[380px] xl:max-w-[392px]",
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
                {Array.from({ length: firstDayOfWeek }, (_, index) => {
                  const day = daysInPrevMonth - firstDayOfWeek + 1 + index;
                  const date = new Date(year, month - 1, day);
                  const examDay = hasExamOnDate(date);
                  const selectedDay = isSelectedDate(date);

                  return (
                    <div
                      key={`prev-${index + 1}`}
                      onClick={() => handleDayClick(date)}
                      className={cn(
                        "mx-auto flex h-[26px] w-[26px] cursor-pointer select-none items-center justify-center rounded-full text-[10px] transition-all",
                        examDay &&
                          "bg-[#e6f4f1] font-bold text-[#006d77] ring-1 ring-[#006d77]/15",
                        selectedDay && "scale-105 ring-2 ring-[#b7d8d2]",
                        !examDay &&
                          !selectedDay &&
                          "text-slate-300 hover:bg-slate-100",
                      )}
                    >
                      {day}
                    </div>
                  );
                })}

                {Array.from({ length: daysInMonth }, (_, index) => {
                  const day = index + 1;
                  const date = new Date(year, month, day);
                  const todayDay = isTodayDate(date);
                  const examDay = hasExamOnDate(date);
                  const selectedDay = isSelectedDate(date);

                  return (
                    <div
                      key={day}
                      onClick={() => handleDayClick(date)}
                      className={cn(
                        "mx-auto flex h-[26px] w-[26px] cursor-pointer select-none items-center justify-center rounded-full text-[10px] transition-all",
                        todayDay &&
                          "bg-[#006d77] font-bold text-white shadow-md shadow-[#006d77]/20",
                        examDay &&
                          !todayDay &&
                          "bg-[#e6f4f1] font-bold text-[#006d77] ring-1 ring-[#006d77]/15",
                        selectedDay && "scale-105 ring-2 ring-[#b7d8d2]",
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

                {Array.from({ length: trailingDays }, (_, index) => {
                  const day = index + 1;
                  const date = new Date(year, month + 1, day);
                  const examDay = hasExamOnDate(date);
                  const selectedDay = isSelectedDate(date);

                  return (
                    <div
                      key={`next-${index + 1}`}
                      onClick={() => handleDayClick(date)}
                      className={cn(
                        "mx-auto flex h-[26px] w-[26px] cursor-pointer select-none items-center justify-center rounded-full text-[10px] transition-all",
                        examDay &&
                          "bg-[#e6f4f1] font-bold text-[#006d77] ring-1 ring-[#006d77]/15",
                        selectedDay && "scale-105 ring-2 ring-[#b7d8d2]",
                        !examDay &&
                          !selectedDay &&
                          "text-slate-300 hover:bg-slate-100",
                      )}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3">
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
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
