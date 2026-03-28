"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const skillsData = [
  { skill: "Асуудал шийдэх", value: 85 },
  { skill: "Онол", value: 78 },
  { skill: "Хэрэглээ", value: 82 },
  { skill: "Шинжилгээ", value: 90 },
  { skill: "Код бичих", value: 88 },
  { skill: "Математик", value: 75 },
];

const chartConfig = {
  grade: {
    label: "Grade",
    color: "var(--color-chart-1)",
  },
};

export default function GradesSkills() {
  return (
    <Card>
      <CardHeader>
        <CardTitle> Шалгалтын дүн дээр тулгуурласан чадварын задлал</CardTitle>
        {/* <CardDescription>
          Шалгалтын дүн дээр тулгуурласан чадварын задлал
        </CardDescription> */}
      </CardHeader>
      <CardContent className="flex justify-center mt-5">
        <ChartContainer config={chartConfig} className="h-75 w-full max-w-md">
          <RadarChart data={skillsData}>
            <PolarGrid stroke="var(--color-border)" />
            <PolarAngleAxis
              dataKey="skill"
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }}
            />
            <Radar
              name="Skills"
              dataKey="value"
              stroke="var(--color-chart-1)"
              fill="var(--color-chart-1)"
              fillOpacity={0.3}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
