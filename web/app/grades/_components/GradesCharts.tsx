"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { grades } from "@/lib/data";

const overallTrendData = [
  { month: "9-р сар", gpa: 3.2 },
  { month: "10-р сар", gpa: 3.4 },
  { month: "11-р сар", gpa: 3.3 },
  { month: "12-р сар", gpa: 3.5 },
  { month: "1-р сар", gpa: 3.6 },
  { month: "2-р сар", gpa: 3.7 },
  { month: "3-р сар", gpa: 3.65 },
];

const courseComparisonData = grades.map((course, index) => ({
  course: course.courseCode,
  grade: course.currentGrade,
  fill: `var(--color-chart-${index + 1})`,
}));

const chartConfig = {
  gpa: {
    label: "GPA",
    color: "var(--color-chart-1)",
  },
  grade: {
    label: "Grade",
    color: "var(--color-chart-1)",
  },
};

export default function GradesCharts() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>GPA Үзүүлэлт</CardTitle>
          {/* <CardDescription>Цаг хугацааны явц дахь амжилт</CardDescription> */}
        </CardHeader>
        <CardContent className="mt-5">
          <ChartContainer config={chartConfig} className="h-62.5 w-full">
            <LineChart data={overallTrendData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
              />
              <XAxis
                dataKey="month"
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[2.5, 4.0]}
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="gpa"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                dot={{ fill: "var(--color-chart-1)", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Хичээл бүрийн дүнгийн харьцуулалт</CardTitle>
          {/* <CardDescription>Хичээл бүрийн одоогийн дүн</CardDescription> */}
        </CardHeader>
        <CardContent className="mt-5">
          <ChartContainer config={chartConfig} className="h-62.5 w-full">
            <BarChart data={courseComparisonData} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                horizontal={false}
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="course"
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={60}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="grade"
                radius={[0, 4, 4, 0]}
                fill="var(--color-chart-1)"
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
