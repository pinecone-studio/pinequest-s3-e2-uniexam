import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type Props = {
  title: string;
  value: number;
  icon: LucideIcon;
  iconWrapperClassName: string;
  iconClassName: string;
};

export function StatCard({
  title,
  value,
  icon: Icon,
  iconWrapperClassName,
  iconClassName,
}: Props) {
  return (
    <Card className="rounded-2xl shadow-sm flex justify-center h-[60%]">
      <CardContent className="flex items-center gap-4 p-6">
        <div className={`rounded-2xl p-3 ${iconWrapperClassName}`}>
          <Icon className={`h-5 w-5 ${iconClassName}`} />
        </div>

        <div>
          <div className="text-xl font-semibold">{value}</div>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}
