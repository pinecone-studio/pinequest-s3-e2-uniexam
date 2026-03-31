"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

/* ✅ TYPES */
interface AdvancedFilterProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  courseFilter: string[];
  setCourseFilter: React.Dispatch<React.SetStateAction<string[]>>;
  majorFilter: string[];
  setMajorFilter: React.Dispatch<React.SetStateAction<string[]>>;
  majors: string[];
}

export default function AdvancedFilter({
  open,
  setOpen,
  courseFilter,
  setCourseFilter,
  majorFilter,
  setMajorFilter,
  majors,
}: AdvancedFilterProps) {
  const courses = ["1-р курс", "2-р курс", "3-р курс", "4-р курс"];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl space-y-6">

        {/* TITLE */}
        <DialogTitle className="text-lg font-semibold">Advanced Filter</DialogTitle>
        <DialogTitle asChild>
  <VisuallyHidden>Advanced Filter</VisuallyHidden>
</DialogTitle>

        {/* COURSE */}
        <div>
          <div className="text-sm mb-2 font-medium">Курс</div>

          <div className="flex gap-2 flex-wrap">
            {courses.map((c) => {
              const active = courseFilter.includes(c);

              return (
                <button
                  key={c}
                  onClick={() =>
                    setCourseFilter((prev) =>
                      prev.includes(c)
                        ? prev.filter((x) => x !== c)
                        : [...prev, c]
                    )
                  }
                  className={`px-3 py-1 rounded-full border text-sm transition
                    ${
                      active
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white hover:bg-gray-50"
                    }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* MAJOR */}
        <div>
          <div className="text-sm mb-2 font-medium">Мэргэжил</div>

          <div className="flex gap-2 flex-wrap">
            {majors.map((m) => {
              const active = majorFilter.includes(m);

              return (
                <button
                  key={m}
                  onClick={() =>
                    setMajorFilter((prev) =>
                      prev.includes(m)
                        ? prev.filter((x) => x !== m)
                        : [...prev, m]
                    )
                  }
                  className={`px-3 py-1 rounded-full border text-sm transition
                    ${
                      active
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white hover:bg-gray-50"
                    }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTION */}
        <div className="flex justify-end gap-2 pt-4 border-t">

          {/* CLEAR */}
          <button
            onClick={() => {
              setCourseFilter([]);
              setMajorFilter([]);
            }}
            className="px-4 py-2 text-red-500 hover:bg-red-50 rounded"
          >
            Clear
          </button>

          {/* SAVE */}
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 bg-black text-white rounded hover:opacity-90"
          >
            Save
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
}