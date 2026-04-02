import { Separator } from "@/components/ui/separator";
import { ClassCourse } from "@/lib/grading/types";
import { CircleCheckBig, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

type ExamCardProps = {
  course: ClassCourse;
};

export const ExamCard = ({ course }: ExamCardProps) => {
  const router = useRouter();
  if (!course || (course.total ?? 0) <= 0) return null;

  const progress = Math.round((course.graded / course.total) * 100);
  const isComplete = course.pending === 0;

  return (
    <div
      className="relative bg-white border border-gray-200 rounded-2xl p-5 cursor-pointer hover:shadow-sm hover:border-[#31A8E0]/50 transition-all duration-200 flex flex-col gap-3"
      onClick={() => router.push(`/grading/${course.id}`)}
    >
      <div className="flex items-center justify-between gap-2">
        {course.assignmentLabel ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="inline-block max-w-[100px] truncate text-xs py-0.5"
                >
                  {course.assignmentLabel}
                </Badge>
              </TooltipTrigger>
              <TooltipContent sideOffset={8}>
                {course.assignmentLabel}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div className="h-6" />
        )}

        {course.pending > 0 && (
          <span className="inline-flex items-center text-[11px] leading-none font-medium text-[#C27A17] bg-[#FFF7E8] border border-[#F5D8A8] px-2 py-1 rounded-full">
            {course.pending} хүлээгдэж байна
          </span>
        )}
      </div>
      <div>
        <h3 className="text-base font-bold text-gray-900">{course.code}</h3>
        <p className="text-sm text-gray-500 mt-0.5">{course.name}</p>
      </div>
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
            className="bg-[#31A8E0] h-2 rounded-full transition-all"
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
            <CircleCheckBig size={16} color="#1F9D8B" strokeWidth={2.5} />
            <span className="ml-1 text-[#1F9D8B] font-medium">Дууссан</span>
          </div>
        )}
      </div>
    </div>
  );
};
