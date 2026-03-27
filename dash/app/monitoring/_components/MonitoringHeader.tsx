import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  classFilter: string;
  classOptions: string[];
  onClassChange: (value: string) => void;
};

export function MonitoringHeader({
  classFilter,
  classOptions,
  onClassChange,
}: Props) {
  const selectedClassTitle = classFilter === "all" ? "Бүх анги" : classFilter;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">
            Шалгалтын хяналт
          </h1>

          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            Шууд
          </Badge>
        </div>

        <p className="mt-2 truncate text-muted-foreground">
          {selectedClassTitle} - Шууд хяналтын самбар
        </p>
      </div>

      <div className="w-full shrink-0 lg:w-[320px]">
        <Select value={classFilter} onValueChange={onClassChange}>
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="Анги сонгох" />
          </SelectTrigger>

          <SelectContent className="w-[--radix-select-trigger-width] min-w-[--radix-select-trigger-width]">
            <SelectItem value="all" className="truncate">
              Бүх анги
            </SelectItem>

            {classOptions.map((className) => (
              <SelectItem
                key={className}
                value={className}
                className="truncate"
              >
                {className}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
