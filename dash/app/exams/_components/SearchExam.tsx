import { Input } from "@base-ui/react";
import { Search } from "lucide-react";
import type { ChangeEvent } from "react";

interface SearchExamProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchExam = ({ value, onChange }: SearchExamProps) => {
  return (
    <div className="max-w-80 h-9 rounded-sm">
      <div className="relative max-w-sm h-9">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={16}
        />
        <Input
          placeholder="Шалгалт хайх..."
          className="pl-10 bg-white h-9 rounded-sm"
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onChange(e.target.value)
          }
        />
      </div>
    </div>
  );
};
