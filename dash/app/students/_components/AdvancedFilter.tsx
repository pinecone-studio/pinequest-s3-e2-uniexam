"use client";

import { useMemo } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BadgeCheck, RotateCcw, SlidersHorizontal } from "lucide-react";

interface AdvancedFilterProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  courseFilter: string[];
  setCourseFilter: React.Dispatch<React.SetStateAction<string[]>>;
  classFilter: string[];
  setClassFilter: React.Dispatch<React.SetStateAction<string[]>>;
  majorFilter: string[];
  setMajorFilter: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function AdvancedFilter({
  open,
  setOpen,
  courseFilter,
  setCourseFilter,
  classFilter,
  setClassFilter,
  majorFilter,
  setMajorFilter,
}: AdvancedFilterProps) {
  const strictCourses = ["1-р курс", "2-р курс", "3-р курс", "4-р курс"];
  const strictClasses = ["CS101", "CS201", "CS301", "CS401"];
  const strictMajors = [
    "Computer Science",
    "Algorithms",
    "Software",
    "Cybersecurity",
  ];

  const selectedCount = useMemo(
    () => courseFilter.length + classFilter.length + majorFilter.length,
    [courseFilter.length, classFilter.length, majorFilter.length]
  );

  const toggleItem = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <div className="border-b bg-gradient-to-r from-slate-900 to-slate-700 text-white px-6 py-5">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <SlidersHorizontal className="h-5 w-5" />
            Advanced Filters
          </DialogTitle>
          <p className="text-sm text-slate-200 mt-1">
            Course, class, major-аар шүүнэ. {selectedCount} сонголт идэвхтэй.
          </p>
        </div>

        <div className="p-6 space-y-6 bg-slate-50">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-800">Course</p>
            <div className="flex flex-wrap gap-2">
              {strictCourses.map((c) => {
                const active = courseFilter.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() => toggleItem(c, setCourseFilter)}
                    className={`px-3 py-1.5 rounded-lg border text-sm transition ${
                      active
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-slate-700 border-slate-300 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-800">Class</p>
            <div className="flex flex-wrap gap-2">
              {strictClasses.map((c) => {
                const active = classFilter.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() => toggleItem(c, setClassFilter)}
                    className={`px-3 py-1.5 rounded-lg border text-sm transition ${
                      active
                        ? "bg-blue-600 text-white border-violet-600 shadow-sm"
                        : "bg-white text-slate-700 border-slate-300 hover:border-violet-300 hover:bg-violet-50"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-800">Major</p>
            <div className="flex flex-wrap gap-2">
              {strictMajors.map((m) => {
                const active = majorFilter.includes(m);
                return (
                  <button
                    key={m}
                    onClick={() => toggleItem(m, setMajorFilter)}
                    className={`px-3 py-1.5 rounded-lg border text-sm transition ${
                      active
                        ? "bg-blue-600 text-white border-emerald-600 shadow-sm"
                        : "bg-white text-slate-700 border-slate-300 hover:border-emerald-300 hover:bg-emerald-50"
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t bg-white px-6 py-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => {
              setCourseFilter([]);
              setClassFilter([]);
              setMajorFilter([]);
            }}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)} className="gap-2">
              <BadgeCheck className="h-4 w-4" />
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
