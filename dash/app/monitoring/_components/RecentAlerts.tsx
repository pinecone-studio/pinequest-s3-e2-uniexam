"use client";

import { AlertTriangle, Clock3, Smartphone, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { ProctorAlert } from "../_lib/types";

type Props = {
  alerts: ProctorAlert[];
};

function getAlertIcon(type: ProctorAlert["type"]) {
  switch (type) {
    case "phone_visible":
      return <Smartphone className="h-4 w-4" />;
    case "multiple_people":
      return <Users className="h-4 w-4" />;
    default:
      return <AlertTriangle className="h-4 w-4" />;
  }
}

export function RecentAlerts({ alerts }: Props) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Сүүлийн анхааруулгууд</h2>
          <span className="text-sm text-muted-foreground">
            Нийт {alerts.length}
          </span>
        </div>

        {alerts.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
            Одоогоор анхааруулга алга
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.slice(0, 8).map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start justify-between rounded-2xl border p-4 ${
                  alert.severity === "danger"
                    ? "border-red-200 bg-red-50"
                    : "border-amber-200 bg-amber-50"
                }`}
              >
                <div className="flex gap-3">
                  <div
                    className={`mt-0.5 rounded-full p-2 ${
                      alert.severity === "danger"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {getAlertIcon(alert.type)}
                  </div>

                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm text-muted-foreground">
                      {alert.studentName} • {alert.className}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock3 className="h-4 w-4" />
                  {new Date(alert.createdAt).toLocaleTimeString("mn-MN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
