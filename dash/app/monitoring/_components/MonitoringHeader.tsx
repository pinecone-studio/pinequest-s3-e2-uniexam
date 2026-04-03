import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

type Props = {
  classFilter: string;
  isExamScoped?: boolean;
  classOptions: Array<{
    value: string;
    label: string;
  }>;
  onClassChange: (value: string) => void;
};

export function MonitoringHeader({
  classFilter,
  isExamScoped = false,
  classOptions,
  onClassChange,
}: Props) {
  const selectedClassTitle =
    classFilter === "all"
      ? "Бүх анги"
      : (classOptions.find((option) => option.value === classFilter)?.label ??
        "Бүх анги");

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--monitoring-dark)]">
            Шалгалтын хяналт
          </h1>

          <Badge className="border-0 bg-[var(--monitoring-primary-soft)] text-[var(--monitoring-primary)] hover:bg-[var(--monitoring-primary-soft)]">
            Шууд
          </Badge>
        </div>

        <p className="mt-2 truncate text-[var(--monitoring-muted)]">
          {selectedClassTitle} - Шууд хяналтын самбар
        </p>
      </div>

      <div className="w-full shrink-0 lg:w-[320px]">
        {isExamScoped ? (
          <Link href="/monitoring">
            <Button
              type="button"
              variant="outline"
              className="w-full justify-center border-[var(--monitoring-dark-border)] bg-white text-[var(--monitoring-dark)] hover:bg-[var(--monitoring-primary-soft)]"
              onClick={() => onClassChange("all")}
            >
              Бүх анги
            </Button>
          </Link>
        ) : (
          <Select value={classFilter} onValueChange={onClassChange}>
            <SelectTrigger className="w-full border-[var(--monitoring-dark-border)] bg-white text-[var(--monitoring-dark)] focus:border-[#00B89C] focus:ring-2 focus:ring-[#00B89C]/15 focus:ring-offset-0 data-[placeholder]:text-[var(--monitoring-muted)]">
              <SelectValue placeholder="Анги сонгох" />
            </SelectTrigger>

            <SelectContent className="w-[--radix-select-trigger-width] min-w-[--radix-select-trigger-width] border-[var(--monitoring-dark-border)] bg-white">
              <SelectItem
                value="all"
                className="truncate text-[var(--monitoring-dark)] focus:bg-[var(--monitoring-primary-soft)] focus:text-[var(--monitoring-dark)]"
              >
                Бүх анги
              </SelectItem>

              {classOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="truncate text-[var(--monitoring-dark)] focus:bg-[var(--monitoring-primary-soft)] focus:text-[var(--monitoring-dark)]"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
