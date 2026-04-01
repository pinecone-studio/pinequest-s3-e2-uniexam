import { Separator } from "@/components/ui/separator";
import { ClassCourse } from "@/lib/grading/types";
import { CircleCheckBig, FileText, Users } from "lucide-react";
import { useRouter } from "next/navigation";

type ExamCardProps = {
  course: ClassCourse;
};

export const ExamCard = ({ course }: ExamCardProps) => {
  const router = useRouter();
  const progress = Math.round((course.graded / course.total) * 100);
  const isComplete = course.pending === 0;

  return (
    <div
      className="relative bg-white border border-gray-200 rounded-2xl p-5 cursor-pointer hover:shadow-sm hover:border-blue-300 transition-all duration-200 flex flex-col gap-3"
      onClick={() => router.push(`/grading/${course.id}`)}
    >
      {course.pending > 0 && (
        <span className="absolute top-4 right-4 text-xs font-medium text-red-700 bg-red-50 border-red-100 px-2.5 py-1 rounded-full">
          {course.pending} хүлээгдэж байна
        </span>
      )}

      <div className="rounded-lg h-10 w-10 bg-blue-50 flex items-center justify-center text-blue-500">
        <FileText size={20} />
      </div>

      <div>
        <h3 className="text-base font-bold text-gray-900">{course.code}</h3>
        <p className="text-sm text-gray-500 mt-0.5">{course.name}</p>
      </div>

      {course.assignmentLabel ? (
        <span className="self-start text-xs border border-gray-200 rounded-sm px-3 py-1 text-gray-600">
          {course.assignmentLabel}
        </span>
      ) : (
        <div className="h-6.75"></div>
      )}

      <Separator />

      <div>
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-gray-500">Дүгнэлтийн явц</span>
          <span className="font-medium text-gray-800">
            {course.graded}/{course.total}
          </span>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-1.5 text-sm text-gray-500">
        <div className="flex items-center gap-1.5">
          <Users size={14} /> {course.total} оюутан
        </div>
        {isComplete && (
          <div className="flex items-center gap-1.5">
            <CircleCheckBig size={16} color="#00a63e" strokeWidth={2.5} />
            <span className="ml-1 text-green-600 font-medium">Дууссан</span>
          </div>
        )}
      </div>
    </div>
  );
};
