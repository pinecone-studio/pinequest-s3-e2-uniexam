import { BookOpen } from "lucide-react";

const courses = [
  { id: 1, name: "Компьютерийн ухаан", code: "CS101" },
  { id: 2, name: "Математик", code: "MATH201" },
  { id: 3, name: "Физик", code: "PHY101" },
  { id: 4, name: "Англи хэлний уран зохиол", code: "ENG102" },
  { id: 5, name: "Өгөгдлийн бүтэц", code: "CS202" },
  { id: 6, name: "Алгоритм", code: "CS301" },
];
export const MyCourses = () => {
  return (
    <div className="w-full">
      <h2 className="mb-4 text-base font-semibold text-foreground">
        Миний хичээлүүд
      </h2>
      <div className="space-y-1.5">
        {courses.map((course) => (
          <div
            key={course.id}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-colors hover:bg-primary/5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{course.name}</p>
              <p className="text-xs text-muted-foreground">{course.code}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
