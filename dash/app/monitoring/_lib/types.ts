export type StudentStatus = "online" | "offline" | "submitted";

export type StudentAlert = {
  type: "phone" | "tab" | "headpose" | "people";
  message: string;
  time: string;
};

export type Student = {
  id: number;
  name: string;
  email: string;
  className: string;
  status: StudentStatus;
  currentQuestion: number;
  totalQuestions: number;
  submittedMinutesAgo?: number;
  tabSwitches: number;
  latestAlert?: StudentAlert | null;
};

export type ProctorAlertType =
  | "phone_visible"
  | "multiple_people"
  | "head_pose"
  | "tab_switch"
  | "review";

export type ProctorAlertSeverity = "warning" | "danger";

export type ProctorAlert = {
  id: string;
  studentId: number;
  studentName: string;
  className: string;
  type: ProctorAlertType;
  severity: ProctorAlertSeverity;
  message: string;
  createdAt: string;
};
