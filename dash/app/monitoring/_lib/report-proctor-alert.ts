type ReportProctorAlertInput = {
  studentId: number;
  studentName: string;
  className: string;
  type:
    | "phone_visible"
    | "multiple_people"
    | "head_pose"
    | "tab_switch"
    | "review";
  severity: "warning" | "danger";
  message: string;
};

export async function reportProctorAlert(input: ReportProctorAlertInput) {
  try {
    await fetch("/api/proctor-alerts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
  } catch (error) {
    console.error("Alert илгээж чадсангүй", error);
  }
}
