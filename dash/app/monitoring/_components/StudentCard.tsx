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

import {
  getAlertTypeLabel,
  getInitials,
  getStatusLabel,
} from "../_lib/helpers";
import type { Student, StudentAlert } from "../_lib/types";

type Props = {
  student: Student;
};

function getAlertIcon(type?: StudentAlert["type"]) {
  switch (type) {
    case "phone":
      return <Smartphone className="h-5 w-5" />;
    case "people":
      return <Users className="h-5 w-5" />;
    default:
      return <AlertTriangle className="h-5 w-5" />;
  }
}

function StudentCardContent({
  student,
  clickable = false,
}: {
  student: Student;
  clickable?: boolean;
}) {
  const progressPercent =
    (student.currentQuestion / student.totalQuestions) * 100;

  const hasAlert = student.tabSwitches > 0 || Boolean(student.latestAlert);

  const statusIcon =
    student.status === "online" ? (
      <Wifi className="h-4 w-4 text-[var(--monitoring-primary)]" />
    ) : student.status === "offline" ? (
      <WifiOff className="h-4 w-4 text-[var(--monitoring-muted)]" />
    ) : (
      <CheckCircle2 className="h-4 w-4 text-[var(--monitoring-dark)]" />
    );

  const statusTextClassName =
    student.status === "online"
      ? "text-[var(--monitoring-primary)]"
      : student.status === "offline"
        ? "text-[var(--monitoring-muted)]"
        : "text-[var(--monitoring-dark)]";

  return (
    <Card
      className={`rounded-2xl border shadow-sm transition ${
        hasAlert
          ? "border-[var(--monitoring-warning-border)] bg-[var(--monitoring-warning-surface)]"
          : "border-[var(--monitoring-dark-border)] bg-white"
      } ${clickable ? "cursor-pointer hover:bg-[var(--monitoring-warning-surface-strong)]" : ""}`}>
      <CardContent className="p-2">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--monitoring-primary-soft)] font-semibold text-[var(--monitoring-primary)]">
              {getInitials(student.name)}
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold leading-none text-[var(--monitoring-dark)]">
                {student.name}
              </h3>
              <p className="mt-1 truncate text-xs text-[var(--monitoring-muted)]">
                {student.email}
              </p>
            </div>
          </div>

          {hasAlert && (
            <Badge className="border-0 bg-[var(--monitoring-warning)] text-white hover:bg-[var(--monitoring-warning)]">
              <AlertTriangle className="mr-1 h-3.5 w-3.5" />
              Зөрчил
            </Badge>
          )}
        </div>

        <div className="mb-5 flex items-center gap-2 text-sm">
          {statusIcon}
          <span className={statusTextClassName}>
            {getStatusLabel(student.status)}
          </span>
        </div>

        {student.status === "submitted" ? (
          <p className="text-sm text-[var(--monitoring-muted)]">
            Илгээсэн {student.submittedMinutesAgo} минутын өмнө
          </p>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-xs leading-0 text-[var(--monitoring-muted)]">
                Ахиц
              </span>
              <span className="font-medium text-xs leading-0 text-[var(--monitoring-dark)]">
                Асуулт {student.currentQuestion}/{student.totalQuestions}
              </span>
            </div>

            <Progress
              value={progressPercent}
              className="h-2 bg-(--monitoring-dark-soft) [&>div]:bg-(--monitoring-primary)"
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
    return <StudentCardContent student={student} />;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="w-full text-left">
          <StudentCardContent student={student} clickable />
        </button>
      </DialogTrigger>

      <DialogContent className="border-(--monitoring-dark-border) bg-white text-(--monitoring-dark) sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-(--monitoring-dark)">
            Зөрчлийн мэдээлэл
          </DialogTitle>
          <DialogDescription className="text-(--monitoring-muted)">
            Сурагч дээр илэрсэн анхааруулгын дэлгэрэнгүй
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-(--monitoring-dark-border) bg-(--monitoring-primary-surface) p-4">
            <p className="text-sm text-(--monitoring-muted)">Сурагч</p>
            <p className="font-semibold text-(--monitoring-dark)">
              {student.name}
            </p>
            <p className="text-sm text-(--monitoring-muted)">{student.email}</p>
          </div>

          <div className="rounded-xl border border-(--monitoring-warning-border) bg-(--monitoring-warning-surface) p-4">
            <div className="mb-3 flex items-center gap-2 text-(--monitoring-warning)">
              {getAlertIcon(student.latestAlert?.type)}
              <span className="font-semibold">
                {student.latestAlert?.message ??
                  getAlertTypeLabel(student.latestAlert?.type)}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-(--monitoring-muted)">
                  Зөрчлийн төрөл
                </span>
                <span className="font-medium text-(--monitoring-dark)">
                  {getAlertTypeLabel(student.latestAlert?.type)}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-(--monitoring-muted)">
                  Илэрсэн хугацаа
                </span>
                <span className="font-medium text-(--monitoring-dark)">
                  {student.latestAlert?.time ?? "Саяхан"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-(--monitoring-muted)">
                  Tab сольсон тоо
                </span>
                <span className="font-medium text-(--monitoring-dark)">
                  {student.tabSwitches} удаа
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-(--monitoring-muted)">
                  Одоогийн төлөв
                </span>
                <span className="font-medium text-(--monitoring-dark)">
                  {getStatusLabel(student.status)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
