"use client";

import { useEffect, useRef } from "react";
import { reportProctorAlert } from "../_lib/report-proctor-alert";

// state гэдэг нь чиний proctor monitor-оос ирж байгаа data гэж үзэв
// peopleCount, headPose, phoneVisible, suspicious гэх мэт

const student = {
  id: 1,
  name: "Алекс Томпсон",
  className: "МТ101 - Компьютерын ухааны үндэс",
};

export function ExamAlertReporter({
  state,
}: {
  state: {
    peopleCount: number;
    headPose: string;
    phoneVisible: boolean;
    suspicious: boolean;
  };
}) {
  const lastAlertRef = useRef("");

  useEffect(() => {
    let nextAlert: {
      type: "phone_visible" | "multiple_people" | "head_pose" | "review";
      severity: "warning" | "danger";
      message: string;
    } | null = null;

    if (state.phoneVisible) {
      nextAlert = {
        type: "phone_visible",
        severity: "danger",
        message: "Утас илэрлээ",
      };
    } else if (state.peopleCount > 1) {
      nextAlert = {
        type: "multiple_people",
        severity: "danger",
        message: "Нэмэлт хүн илэрлээ",
      };
    } else if (state.headPose !== "forward" && state.headPose !== "no-face") {
      nextAlert = {
        type: "head_pose",
        severity: "warning",
        message: "Сурагч дэлгэцээс өөр тийш харж байна",
      };
    } else if (state.suspicious) {
      nextAlert = {
        type: "review",
        severity: "warning",
        message: "Сэжигтэй үйлдэл илэрлээ",
      };
    }

    if (!nextAlert) return;

    const dedupeKey = `${student.id}-${nextAlert.type}-${nextAlert.message}`;

    if (lastAlertRef.current === dedupeKey) return;

    lastAlertRef.current = dedupeKey;

    reportProctorAlert({
      studentId: student.id,
      studentName: student.name,
      className: student.className,
      type: nextAlert.type,
      severity: nextAlert.severity,
      message: nextAlert.message,
    });

    const timer = setTimeout(() => {
      if (lastAlertRef.current === dedupeKey) {
        lastAlertRef.current = "";
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [state]);

  return null;
}
