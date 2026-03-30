import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StudentFilter = "all" | "alert";

type Props = {
  searchTerm: string;
  studentFilter: StudentFilter;
  onSearchChange: (value: string) => void;
  onStudentFilterChange: (value: StudentFilter) => void;
};

export function MonitoringFilters({
  searchTerm,
  studentFilter,
  onSearchChange,
  onStudentFilterChange,
}: Props) {
  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
      <div className="relative w-full sm:w-[320px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--monitoring-muted)]" />

        <Input
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Сурагчийн нэрээр хайх..."
          className="border-[var(--monitoring-dark-border)] bg-white pl-9 text-[var(--monitoring-dark)] placeholder:text-[var(--monitoring-muted)] focus-visible:border-[#00B89C] focus-visible:ring-2 focus-visible:ring-[#00B89C]/15 focus-visible:ring-offset-0"
        />
      </div>

      <Select
        value={studentFilter}
        onValueChange={(value: StudentFilter) => onStudentFilterChange(value)}>
        <SelectTrigger className="w-full border-[var(--monitoring-dark-border)] bg-white text-[var(--monitoring-dark)] focus:border-[#00B89C] focus:ring-2 focus:ring-[#00B89C]/15 focus:ring-offset-0 data-[placeholder]:text-[var(--monitoring-muted)] sm:w-[220px]">
          <SelectValue placeholder="Шүүлтүүр" />
        </SelectTrigger>

        <SelectContent className="w-[--radix-select-trigger-width] min-w-[--radix-select-trigger-width] border-[var(--monitoring-dark-border)] bg-white">
          <SelectItem
            value="all"
            className="text-[var(--monitoring-dark)] focus:bg-[var(--monitoring-primary-soft)] focus:text-[var(--monitoring-dark)]">
            Бүх сурагч
          </SelectItem>

          <SelectItem
            value="alert"
            className="text-[var(--monitoring-dark)] focus:bg-[var(--monitoring-primary-soft)] focus:text-[var(--monitoring-dark)]">
            Зөвхөн зөрчилтэй
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
