import { Skeleton } from "@/components/ui/skeleton";

export default function StudentTableSkeleton() {
  return (
    <div className="p-6">
      <div className="py-4 flex gap-2 max-h-17">
        <Skeleton className="h-9 w-64 bg-white rounded-2xl" />
        <Skeleton className="h-9 w-29 bg-white rounded-2xl" />
      </div>
      <div className="rounded-2xl border bg-white overflow-hidden">
        <div className="max-h-[70vh] overflow-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-white">
                <th className="sticky top-0 z-10 bg-white px-6 py-4 text-sm font-semibold text-slate-900">
                  Оюутнууд
                </th>
                <th className="sticky top-0 z-10 bg-white px-6 py-4 text-sm font-semibold text-slate-900">
                  Анги
                </th>
                <th className="sticky top-0 z-10 bg-white px-6 py-4 text-sm font-semibold text-slate-900">
                  Шалгалтын нэр
                </th>
                <th className="sticky top-0 z-10 bg-white px-6 py-4 text-sm font-semibold text-slate-900">
                  Курс
                </th>
                <th className="sticky top-0 z-10 bg-white px-6 py-4 text-sm font-semibold text-slate-900">
                  Шалгалтын тоо
                </th>
                <th className="sticky top-0 z-10 bg-white px-6 py-4 text-sm font-semibold text-slate-900">
                  Зөрчилийн тоо
                </th>
                <th className="sticky top-0 z-10 bg-white px-6 py-4 text-sm font-semibold text-slate-900">
                  Дүн
                </th>
                <th className="sticky top-0 z-10 bg-white px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {[...Array(6)].map((_, i) => (
                <tr
                  key={i}
                  className="border-b last:border-0 border-slate-100 h-18"
                >
                  <td className="px-6 py-4">
                    <div className="flex gap-3 items-center">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-12" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-8" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-6" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-6" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-10" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-8 rounded-2xl" />
                      <Skeleton className="h-8 w-8 rounded-2xl" />
                      <Skeleton className="h-8 w-8 rounded-2xl" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
