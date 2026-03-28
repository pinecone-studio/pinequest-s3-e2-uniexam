import GradesOverview from "./GradesOverview";
import GradesCharts from "./GradesCharts";
import GradesCourses from "./GradesCourses";
import GradesSkills from "./GradesSkills";

export default function GradesPage() {
  return (
    <div className="space-y-6">
      <GradesOverview />
      <GradesCharts />
      <GradesCourses />
      <GradesSkills />
    </div>
  );
}
