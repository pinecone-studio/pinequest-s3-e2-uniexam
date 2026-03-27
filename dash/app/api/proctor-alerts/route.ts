import { NextResponse } from "next/server";

type ProctorAlertType =
  | "phone_visible"
  | "multiple_people"
  | "head_pose"
  | "tab_switch"
  | "review";

type ProctorAlertSeverity = "warning" | "danger";

type ProctorAlert = {
  id: string;
  studentId: number;
  studentName: string;
  className: string;
  type: ProctorAlertType;
  severity: ProctorAlertSeverity;
  message: string;
  createdAt: string;
};

const globalForAlerts = globalThis as typeof globalThis & {
  __proctorAlerts?: ProctorAlert[];
};

if (!globalForAlerts.__proctorAlerts) {
  globalForAlerts.__proctorAlerts = [];
}

export async function GET() {
  return NextResponse.json({
    alerts: globalForAlerts.__proctorAlerts ?? [],
  });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Omit<ProctorAlert, "id" | "createdAt">;

  const nextAlert: ProctorAlert = {
    id: crypto.randomUUID(),
    studentId: body.studentId,
    studentName: body.studentName,
    className: body.className,
    type: body.type,
    severity: body.severity,
    message: body.message,
    createdAt: new Date().toISOString(),
  };

  globalForAlerts.__proctorAlerts = [
    nextAlert,
    ...(globalForAlerts.__proctorAlerts ?? []),
  ].slice(0, 200);

  return NextResponse.json({ ok: true });
}
