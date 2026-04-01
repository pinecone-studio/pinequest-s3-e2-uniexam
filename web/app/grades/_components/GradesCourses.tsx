"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { UseGradesCoursesResult } from "../_hooks/use-grades-courses";

function getLetterGrade(percentage: number): string {
  if (percentage >= 93) return "A";
  if (percentage >= 90) return "A-";
  if (percentage >= 87) return "B+";
  if (percentage >= 83) return "B";
  if (percentage >= 80) return "B-";
  if (percentage >= 77) return "C+";
  if (percentage >= 73) return "C";
  if (percentage >= 70) return "C-";
  if (percentage >= 67) return "D+";
  if (percentage >= 63) return "D";
  if (percentage >= 60) return "D-";
  return "F";
}

function getGradeColor(percentage: number): string {
  if (percentage >= 90) return "text-green-500";
  if (percentage >= 80) return "text-blue-500";
  if (percentage >= 70) return "text-yellow-500";
  return "text-red-500";
}

type GradesCoursesProps = UseGradesCoursesResult;

function GradesCourseItemSkeleton() {
  return (
    <div className="rounded-lg border">
      <div className="h-auto w-full p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-17.5 rounded-full" />
            <Skeleton className="h-5 w-45" />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <Skeleton className="h-7 w-17.5" />
            </div>
            <Skeleton className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GradesCourses({
  courses,
  loading,
  error,
  message,
}: GradesCoursesProps) {
  const [expandedCourses, setExpandedCourses] = useState<string[]>([]);

  const toggleCourse = (courseId: string) => {
    setExpandedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId],
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Хичээлийн дүнгийн дэлгэрэнгүй</CardTitle>
        <CardDescription>
          Хичээлээ задлаад шалгалтын бодит оноо, төлөвийг харна.
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-6 space-y-4">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <GradesCourseItemSkeleton key={index} />
            ))
          : null}

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {!loading && !error && courses.length === 0 ? (
          <div className="rounded-lg border p-4 text-sm text-gray-500 border-gray-200 bg-gray-50">
            {message}
          </div>
        ) : null}

        {!loading &&
          !error &&
          courses.map((course) => {
            const isExpanded = expandedCourses.includes(course.courseId);
            const letterGrade =
              course.currentGrade !== null
                ? getLetterGrade(course.currentGrade)
                : null;
            const gradeColor =
              course.currentGrade !== null
                ? getGradeColor(course.currentGrade)
                : "text-muted-foreground";

            return (
              <Collapsible
                key={course.courseId}
                open={isExpanded}
                onOpenChange={() => toggleCourse(course.courseId)}
              >
                <div className="rounded-lg border">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-auto w-full justify-between p-4 hover:bg-secondary/50"
                    >
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="text-sm">
                          {course.courseCode}
                        </Badge>
                        <span className="font-medium">{course.courseName}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          {course.currentGrade !== null && letterGrade ? (
                            <div className="flex items-center">
                              <span
                                className={`text-lg font-semibold ${gradeColor}`}
                              >
                                {letterGrade}
                              </span>
                              <span className="ml-2 text-sm text-muted-foreground">
                                ({course.currentGrade}%)
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Хүлээгдэж байна
                            </span>
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-t p-4">
                      {course.exams.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Үнэлгээ</TableHead>
                              <TableHead className="text-center">
                                Авсан оноо
                              </TableHead>
                              <TableHead className="text-center">
                                Дээд оноо
                              </TableHead>
                              <TableHead className="text-center">
                                Хувь
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {course.exams.map((exam) => {
                              const percentage =
                                exam.score !== null && exam.maxScore > 0
                                  ? Math.round(
                                      (exam.score / exam.maxScore) * 100,
                                    )
                                  : null;

                              return (
                                <TableRow key={exam.id}>
                                  <TableCell className="font-medium">
                                    {exam.name}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {exam.score !== null ? (
                                      exam.score
                                    ) : exam.status === "submitted" ? (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        Шалгагдаж байна
                                      </Badge>
                                    ) : (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        Өгөөгүй
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {exam.maxScore > 0 ? exam.maxScore : "-"}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {percentage !== null ? (
                                      <span
                                        className={getGradeColor(percentage)}
                                      >
                                        {percentage}%
                                      </span>
                                    ) : (
                                      "-"
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                          Энэ хичээлд хараахан шалгалтын дүн алга.
                        </div>
                      )}
                      <div className="mt-4 flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                        <span className="text-sm font-medium">
                          Хичээлийн дүн
                        </span>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={course.currentGrade ?? 0}
                            className="h-2 w-24"
                          />
                          <span className={`font-semibold ${gradeColor}`}>
                            {course.currentGrade !== null
                              ? `${course.currentGrade}%`
                              : "Хүлээгдэж байна"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
      </CardContent>
    </Card>
  );
}
