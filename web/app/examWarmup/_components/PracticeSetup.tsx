"use client";

import { BookOpen, Clock, Target, Zap } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { upcomingExams } from "@/lib/data";
import type { PracticeMode } from "./practiceTypes";

type PracticeSetupProps = {
  practiceMode: PracticeMode;
  setPracticeMode: (mode: PracticeMode) => void;
  selectedExam: string | null;
  setSelectedExam: (id: string) => void;
  selectedTopic: string | null;
  setSelectedTopic: (topic: string) => void;
  difficulty: string;
  setDifficulty: (value: string) => void;
  isGenerating: boolean;
  onStartPractice: () => void;
};

export default function PracticeSetup({
  practiceMode,
  setPracticeMode,
  selectedExam,
  setSelectedExam,
  selectedTopic,
  setSelectedTopic,
  difficulty,
  setDifficulty,
  isGenerating,
  onStartPractice,
}: PracticeSetupProps) {
  const allTopics = Array.from(
    new Set(upcomingExams.flatMap((exam) => exam.topics)),
  );

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        <Card
          className={`cursor-pointer transition-all ${
            practiceMode === "exam"
              ? "border-primary ring-1 ring-primary"
              : "hover:border-primary/50"
          }`}
          onClick={() => setPracticeMode("exam")}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Шалгалтаар бэлдэх</CardTitle>
                <CardDescription>
                  Тухайн шалгалтаас асуулт үүсгэх
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${
            practiceMode === "topic"
              ? "border-primary ring-1 ring-primary"
              : "hover:border-primary/50"
          }`}
          onClick={() => setPracticeMode("topic")}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Сэдвээр бэлдэх</CardTitle>
                <CardDescription>
                  Сайжруулахыг хүссэн сэдэв дээр төвлөрөх
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {/* <Sparkles className="h-5 w-5 text-primary" /> */}
            Тохиргоо
          </CardTitle>
          <CardDescription>
            Давтах шалгалтаа сонгон AI-аар асуултууд үүсгээрэй
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {practiceMode === "exam" ? (
            <div className="space-y-2">
              <Label>Ойрын шалгалтыг сонгох</Label>
              <Select
                value={selectedExam || ""}
                onValueChange={setSelectedExam}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Давтлага хийх шалгалтаа сонгоно уу" />
                </SelectTrigger>
                <SelectContent>
                  {upcomingExams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {exam.courseCode}
                        </Badge>
                        <span>{exam.title}</span>
                        <span className="text-muted-foreground">-</span>
                        <span className="text-muted-foreground">
                          {new Date(exam.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedExam && (
                <div className="mt-4 rounded-lg bg-secondary/50 p-4">
                  <h4 className="mb-2 font-medium">Хамрах сэдвүүд:</h4>
                  <div className="flex flex-wrap gap-2">
                    {upcomingExams
                      .find((exam) => exam.id === selectedExam)
                      ?.topics.map((topic) => (
                        <Badge key={topic} variant="secondary">
                          {topic}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Сэдэв сонгох</Label>
                <Select
                  value={selectedTopic || ""}
                  onValueChange={setSelectedTopic}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Давтлага хийх сэдвээ сонгоно уу" />
                  </SelectTrigger>
                  <SelectContent>
                    {allTopics.map((topic) => (
                      <SelectItem key={topic} value={topic}>
                        {topic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Түвшин</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Хялбар</SelectItem>
                    <SelectItem value="medium">Дунд</SelectItem>
                    <SelectItem value="hard">Хүнд</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Button
            className="w-full bg-[#006d77]"
            size="lg"
            onClick={onStartPractice}
            disabled={
              isGenerating ||
              (practiceMode === "exam" ? !selectedExam : !selectedTopic)
            }
          >
            {isGenerating ? (
              <>
                {/* <Zap className="mr-2 h-4 w-4 animate-pulse" /> */}
                Асуулт үүсгэж байна...
              </>
            ) : (
              <>
                {/* <Sparkles className="mr-2 h-4 w-4" /> */}
                Асуулт үүсгэх
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Өнөөдрийн явц</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              45 асуултанд хариулсан
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Зөв хариултын дундаж
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <Progress value={78} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Зарцуулсан хугацаа
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.5ц</div>
            <p className="text-xs text-muted-foreground">Энэ долоо хоногт</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
