"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type FilterTab = "Бүгд" | "Хүлээгдэж байна" | "Дүгнэгдсэн";

type SubmissionsSearchProps = {
  search: string;
  onSearchChange: (val: string) => void;
  activeFilter: FilterTab;
  onFilterChange: (filter: FilterTab) => void;
  counts: { all: number; pending: number; graded: number };
};

const TABS: FilterTab[] = ["Бүгд", "Хүлээгдэж байна", "Дүгнэгдсэн"];

export const SubmissionsSearch = ({
  search,
  onSearchChange,
  activeFilter,
  onFilterChange,
  counts,
}: SubmissionsSearchProps) => {
  const labelMap: Record<FilterTab, string> = {
    Бүгд: `Бүгд (${counts.all})`,
    "Хүлээгдэж байна": `Хүлээгдэж байна (${counts.pending})`,
    Дүгнэгдсэн: `Дүгнэгдсэн (${counts.graded})`,
  };

  return (
    <div className="flex items-center justify-between gap-4 mb-5">
      <div className="relative w-72 flex items-center ">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <Input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Оюутан хайх..."
          className="w-full pl-9 pr-4 py-2 text-xl border border-gray-200 rounded-lg focus:outline-none focus:ring-0 bg-white"
        />
      </div>

      <div className="flex gap-2">
        {TABS.map((tab) => (
          <Button
            key={tab}
            onClick={() => onFilterChange(tab)}
            className={`text-xs px-4 py-2 rounded-xl border font-medium transition-all ${
              activeFilter === tab
                ? "bg-[#31A8E0] text-white border-[#31A8E0]"
                : "bg-white text-gray-600 border-gray-200 "
            }`}
          >
            {labelMap[tab]}
          </Button>
        ))}
      </div>
    </div>
  );
};
