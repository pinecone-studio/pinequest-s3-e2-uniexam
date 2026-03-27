"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Smartphone,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

import { getInitials, getStatusLabel } from "../_lib/helpers";
import type { Student } from "../_lib/types";

type Props = {
  student: Student;
};

function getAlertIcon(type?: "phone" | "tab" | "headpose" | "people") {
  switch (type) {
    case "phone":
      return <Smartphone className="h-5 w-5" />;
    case "people":
      return <Users className="h-5 w-5" />;
    default:
      return <AlertTriangle className="h-5 w-5" />;
  }
}

function getAlertTypeLabel(type?: "phone" | "tab" | "headpose" | "people") {
  switch (type) {
    case "phone":
      return "Утас илэрсэн";
    case "tab":
      return "Tab сольсон";
    case "headpose":
      return "Дэлгэцээс өөр тийш харсан";
    case "people":
      return "Нэмэлт хүн илэрсэн";
    default:
      return "Анхааруулга";
  }
}

function StudentCardView({ student }: Props) {
  const progressPercent =
    (student.currentQuestion / student.totalQuestions) * 100;

  const hasAlert = student.tabSwitches > 0 || Boolean(student.latestAlert);

  const statusIcon =
    student.status === "online" ? (
      <Wifi className="h-4 w-4 text-green-600" />
    ) : student.status === "offline" ? (
      <WifiOff className="h-4 w-4 text-gray-500" />
    ) : (
      <CheckCircle2 className="h-4 w-4 text-blue-600" />
    );

  const statusTextClassName =
    student.status === "online"
      ? "text-green-600"
      : student.status === "offline"
        ? "text-gray-500"
        : "text-blue-600";

  return (
    <Card
      className={`rounded-2xl bg-white shadow-sm transition ${
        hasAlert
          ? "cursor-pointer border-red-300 bg-red-50/40 hover:bg-red-50/60"
          : ""
      }`}
    >
      <CardContent className="p-5 py-2">
        <div className="mb-2 flex items-start justify-between ">
          <div className="flex items-start gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
              {getInitials(student.name)}
            </div>

            <div>
              <h3 className="text-sm font-semibold leading-none">
                {student.name}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {student.email}
              </p>
            </div>
          </div>

          {hasAlert && (
            <Badge className="bg-red-600 text-white hover:bg-red-600">
              <AlertTriangle className="mr-1 h-3.5 w-3.5" />
              {student.tabSwitches > 0
                ? `${student.tabSwitches} удаа`
                : "Анхааруулга"}
            </Badge>
          )}
        </div>

        <div className="mb-2 flex items-center gap-2 text-xs">
          {statusIcon}
          <span className={statusTextClassName}>
            {getStatusLabel(student.status)}
          </span>
        </div>

        {student.status === "submitted" ? (
          <p className="text-sm text-muted-foreground">
            Илгээсэн {student.submittedMinutesAgo} минутын өмнө
          </p>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Ахиц</span>
              <span className="font-normal">
                Асуулт {student.currentQuestion}/{student.totalQuestions}
              </span>
            </div>

            <Progress
              value={progressPercent}
              className="h-2 [&>div]:bg-blue-600"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function StudentCard({ student }: Props) {
  const hasAlert = student.tabSwitches > 0 || Boolean(student.latestAlert);

  if (!hasAlert) {
    return <StudentCardView student={student} />;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div>
          <StudentCardView student={student} />
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Зөрчлийн мэдээлэл</DialogTitle>
          <DialogDescription>
            Сурагч дээр илэрсэн анхааруулгын дэлгэрэнгүй
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border bg-slate-50 p-4">
            <p className="text-sm text-muted-foreground">Сурагч</p>
            <p className="font-semibold">{student.name}</p>
            <p className="text-sm text-muted-foreground">{student.email}</p>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-red-700">
              {getAlertIcon(student.latestAlert?.type)}
              <span className="font-semibold">
                {student.latestAlert?.message ??
                  getAlertTypeLabel(student.latestAlert?.type)}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Зөрчлийн төрөл</span>
                <span className="font-medium">
                  {getAlertTypeLabel(student.latestAlert?.type)}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Илэрсэн хугацаа</span>
                <span className="font-medium">
                  {student.latestAlert?.time ?? "Саяхан"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Tab сольсон тоо</span>
                <span className="font-medium">{student.tabSwitches} удаа</span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Одоогийн төлөв</span>
                <span className="font-medium">
                  {getStatusLabel(student.status)}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Энэ карт дээр дарж зөрчлийн дэлгэрэнгүй мэдээллийг үзэж болно.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
