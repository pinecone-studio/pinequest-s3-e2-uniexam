import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type Tone = "dark" | "primary" | "warning";

type Props = {
  title: string;
  value: number;
  icon: LucideIcon;
  tone?: Tone;
};

const toneStyles: Record<
  Tone,
  {
    iconBgClassName: string;
    iconTextClassName: string;
  }
> = {
  dark: {
    iconBgClassName: "bg-[var(--monitoring-dark-soft)]",
    iconTextClassName: "text-[var(--monitoring-dark)]",
  },
  primary: {
    iconBgClassName: "bg-[var(--monitoring-primary-soft)]",
    iconTextClassName: "text-[var(--monitoring-primary)]",
  },
  warning: {
    iconBgClassName: "bg-[var(--monitoring-warning-soft)]",
    iconTextClassName: "text-[var(--monitoring-warning)]",
  },
};

export function StatCard({ title, value, icon: Icon, tone = "dark" }: Props) {
  const styles = toneStyles[tone];

  return (
    <Card className="rounded-2xl border-[var(--monitoring-dark-border)] bg-white shadow-sm ">
      <CardContent className="flex items-center gap-4 p-2">
        <div className={`rounded-2xl p-4 ${styles.iconBgClassName}`}>
          <Icon className={`h-7 w-7 ${styles.iconTextClassName}`} />
        </div>

        <div>
          <div className="text-3xl font-bold text-[var(--monitoring-dark)]">
            {value}
          </div>
          <p className="text-sm text-[var(--monitoring-muted)]">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}
