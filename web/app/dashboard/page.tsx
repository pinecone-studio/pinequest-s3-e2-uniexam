import {
  ExamCalendar,
  Header,
  StatCards,
  StudyProgressChart,
} from "./_components";
import MyCourses from "./_components/MyCourses";

const DashboardPage = () => {
  return (
    <div className="mx-14 mt-8">
      <Header />
      <StatCards />
      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-start">
        <StudyProgressChart className="min-w-0 lg:basis-0 lg:flex-[1.7]" />
        <ExamCalendar className="min-w-0 lg:basis-0 lg:flex-1" />
      </div>
      <MyCourses />
    </div>
  );
};

export default DashboardPage;
