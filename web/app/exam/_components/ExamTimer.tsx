import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Clock } from "lucide-react";

const getInitialTimeLeft = (
  durationSeconds: number,
  storageKey: string,
) => {
  if (typeof window === "undefined") {
    return durationSeconds;
  }

  const savedEndsAt = localStorage.getItem(storageKey);

  if (!savedEndsAt) {
    return durationSeconds;
  }

  return Math.max(0, Math.ceil((Number(savedEndsAt) - Date.now()) / 1000));
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

const ExamTimer = ({
  durationSeconds = 4500,
  storageKey,
}: {
  durationSeconds?: number;
  storageKey: string;
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(() =>
    getInitialTimeLeft(durationSeconds, storageKey),
  );

  useEffect(() => {
    const savedEndsAt = localStorage.getItem(storageKey);

    if (!savedEndsAt) {
      const endsAt = Date.now() + durationSeconds * 1000;
      localStorage.setItem(storageKey, endsAt.toString());
    }
  }, [durationSeconds, storageKey]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  return (
    <div className="border-none">
      <Card className="flex flex-col gap-2.5 rounded-xl py-4 mb-6 justify-center w-full">
        <CardHeader className="flex gap-2 justify-center items-center">
          <Clock size={16} />
          <p>Үлдсэн цаг</p>
        </CardHeader>
        <CardContent className="justify-center font-mono">
          <p
            className={`text-3xl font-mono font-medium tracking-tight text-center ${timeLeft < 300 ? "text-red-500" : "text-gray-800"}`}
          >
            {formatTime(timeLeft)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamTimer;
