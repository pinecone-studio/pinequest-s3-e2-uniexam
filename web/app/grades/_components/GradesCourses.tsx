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
import { grades } from "@/lib/data";

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

export default function GradesCourses() {
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
        {/* <CardDescription>Хичээлээ задлаад шалгалтын оноог үзнэ</CardDescription> */}
      </CardHeader>
      <CardContent className="space-y-4 mt-5">
        {grades.map((course) => {
          const isExpanded = expandedCourses.includes(course.courseId);
          const letterGrade = getLetterGrade(course.currentGrade);
          const gradeColor = getGradeColor(course.currentGrade);

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
                        <span className={`text-xl font-bold ${gradeColor}`}>
                          {letterGrade}
                        </span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          ({course.currentGrade}%)
                        </span>
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
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Үнэлгээ</TableHead>
                          <TableHead className="text-center">Оноо</TableHead>
                          <TableHead className="text-center">
                            Дээд оноо
                          </TableHead>
                          <TableHead className="text-center">Хувь</TableHead>
                          <TableHead className="text-center">Жин</TableHead>
                          <TableHead className="text-right">
                            Жинлэсэн оноо
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {course.exams.map((exam, index) => {
                          const percentage = exam.score
                            ? Math.round((exam.score / exam.maxScore) * 100)
                            : null;
                          const weightedScore = exam.score
                            ? (
                                (exam.score / exam.maxScore) *
                                exam.weight
                              ).toFixed(1)
                            : null;

                          return (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {exam.name}
                              </TableCell>
                              <TableCell className="text-center">
                                {exam.score !== null ? (
                                  exam.score
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Хүлээгдэж буй
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {exam.maxScore}
                              </TableCell>
                              <TableCell className="text-center">
                                {percentage !== null ? (
                                  <span className={getGradeColor(percentage)}>
                                    {percentage}%
                                  </span>
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {exam.weight}%
                              </TableCell>
                              <TableCell className="text-right">
                                {weightedScore !== null ? (
                                  <span className="font-medium">
                                    {weightedScore}
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
                    <div className="mt-4 flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                      <span className="text-sm font-medium">Хичээлийн дүн</span>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={course.currentGrade}
                          className="h-2 w-24"
                        />
                        <span className={`font-bold ${gradeColor}`}>
                          {course.currentGrade}%
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
