"use client";

import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { UseGradesCoursesResult } from "../_hooks/use-grades-courses";

type GradesRetakeCoursesProps = UseGradesCoursesResult;

export default function GradesRetakeCourses({
  courses,
  loading,
  error,
}: GradesRetakeCoursesProps) {
  const failedCourses = courses.filter(
    (course) => course.currentGrade !== null && course.currentGrade < 61,
  );

  if (loading) {
    return (
      <Card className="gap-0">
        <CardHeader>
          <CardTitle>Дахин шалгалт</CardTitle>
          <CardDescription>
            Дахин шалгалт өгөх боломжтой хичээлүүд.
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-5 space-y-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="flex h-full flex-col justify-between rounded-lg border p-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="inline-flex h-6 items-center rounded-full px-3 text-sm text-transparent">
                    CS101
                  </Skeleton>
                  <Skeleton className="inline-flex h-5 items-center text-sm font-medium text-transparent">
                    Computer Science
                  </Skeleton>
                  <Skeleton className="ml-auto inline-flex h-5 items-center text-sm font-semibold text-transparent">
                    56%
                  </Skeleton>
                </div>
              </div>
              <Skeleton className="mt-2.5 inline-flex h-9 w-full items-center justify-center rounded-md text-sm text-transparent">
                Дахин шалгалт
              </Skeleton>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return null;
  }

  return (
    <Card className="gap-0">
      <CardHeader>
        <CardTitle>Дахин шалгалт</CardTitle>
        <CardDescription>
          Дахин шалгалт өгөх боломжтой хичээлүүд.
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-5 space-y-3">
        {failedCourses.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50  p-4 text-center text-sm text-gray-500">
            Дахин шалгалт өгөх хичээл алга.
          </div>
        ) : (
          failedCourses.map((course) => {
            return (
              <div
                key={course.courseId}
                className="flex h-full flex-col justify-between rounded-lg border p-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-sm">
                      {course.courseCode}
                    </Badge>
                    <span className="font-medium">{course.courseName}</span>
                    <span className="font-semibold text-red-500">
                      {course.currentGrade}%
                    </span>
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="mt-2 w-full bg-[#006d77] hover:bg-[#005861]">
                      Дахин шалгалт
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Дахин шалгалт</AlertDialogTitle>
                      <AlertDialogDescription>
                        Дахин шалгалт өгөх хүсэлт илгээх
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Буцах</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-[#006d77] hover:bg-[#005861]"
                        onClick={() =>
                          toast.success(
                            `${course.courseName} хичээлийн хүсэлт амжилттай илгээгдлээ.`,
                            { position: "top-right" },
                          )
                        }
                      >
                        Илгээх
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
