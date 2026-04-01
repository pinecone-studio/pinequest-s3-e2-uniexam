"use client";

import GradesOverview from "./GradesOverview";
// import GradesCharts from "./GradesCharts";
import GradesCourses from "./GradesCourses";
import GradesRetakeCourses from "./GradesRetakeCourses";
// import GradesSkills from "./GradesSkills";
import { useGradesCourses } from "../_hooks/use-grades-courses";

export default function GradesPage() {
  const gradesCourses = useGradesCourses();

  return (
    <div className="space-y-6">
      <GradesOverview />
      {/* <GradesCharts /> */}
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <GradesCourses {...gradesCourses} />
        </div>
        <div className="w-80">
          <GradesRetakeCourses {...gradesCourses} />
        </div>
      </div>

      {/* <div className="flex items-stretch gap-4">
        <div className="flex-1">
          <GradesCourses {...gradesCourses} />
        </div>
        <div className="w-80">
          <GradesRetakeCourses {...gradesCourses} />
        </div>
      </div> */}
      {/* <GradesSkills /> */}
    </div>
  );
}
