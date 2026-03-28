import { BarChart3, TrendingUp, Award, BookOpen } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { grades } from "@/lib/data";

export default function GradesOverview() {
  const overallGPA = 3.65;
  const totalCredits = 16;
  const averageGrade = Math.round(
    grades.reduce((acc, grade) => acc + grade.currentGrade, 0) / grades.length,
  );

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Дүн</h1>
        <p className="text-muted-foreground">
          Бүх хичээл дээрх үзүүлэлтээ хянах
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">GPA</CardTitle>
            {/* <Award className="h-4 w-4 text-primary" /> */}
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overallGPA.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">4.0-аас</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Кредит</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCredits}</div>
            <p className="text-xs text-muted-foreground">Энэ улирал</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Дундаж дүн</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{averageGrade}%</div>
            <p className="text-xs text-muted-foreground">Бүх хичээлээр</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Үзүүлэлт</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#42c66e]">+0.15</div>
            <p className="text-xs text-muted-foreground">Энэ сард GPA өссөн</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
