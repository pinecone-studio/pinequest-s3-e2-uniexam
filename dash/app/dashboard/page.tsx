import {
  FileText,
  Users,
  CheckCircle,
  AlertTriangle,
  Calendar,
  TrendingUp,
  GraduationCap,
} from "lucide-react";
import { StatCard } from "./_components/StatCard";
import { ExamItem } from "./_components/ExamItem";
import { ActivityItem } from "./_components/ActivityItem";
import { PerformanceCard } from "./_components/PerformanceCard";

export default function DashboardPage() {
  return (
    <div className=" min-h-screen space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Багш та дахин тавтай морил. Энд таны тойм байна.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard
          title="Active Exams"
          value="3"
          subtitle="Одоогоор хийгдэж байна"
          color="bg-blue-100 text-blue-600"
          icon={<FileText size={18} />}
        />
        <StatCard
          title="Total Students"
          value="248"
          subtitle="Бүх ангиудад"
          color="bg-green-100 text-green-600"
          icon={<Users size={18} />}
        />
        <StatCard
          title="Submissions"
          value="186"
          subtitle="Хяналт хүлээгдэж байна"
          color="bg-green-100 text-green-600"
          icon={<CheckCircle size={18} />}
        />
        <StatCard
          title="Alerts"
          value="12"
          subtitle="Таб шилжүүлэгчийг илрүүлсэн"
          color="bg-red-100 text-red-600"
          icon={<AlertTriangle size={18} />}
        />
      </div>

      {/* Middle */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-2xl p-4 border space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Удахгүй болох шалгалтууд</h3>
            <Calendar size={18} />
          </div>

          <ExamItem
            title="Computer Science Fundamentals"
            date="Mar 26, 2026"
            time="10:00 AM"
            students={45}
            duration="2 hours"
          />
          <ExamItem
            title="Data Structures & Algorithms"
            date="Mar 28, 2026"
            time="2:00 PM"
            students={38}
            duration="1.5 hours"
          />
          <ExamItem
            title="Database Systems"
            date="Apr 2, 2026"
            time="9:00 AM"
            students={52}
            duration="2 hours"
          />
        </div>

        <div className="bg-white rounded-2xl p-4 border space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Сүүлийн үеийн үйл ажиллагаа</h3>
            <TrendingUp size={18} />
          </div>

          <ActivityItem
            text="Morgan Davis submitted Computer Science exam"
            time="5 minutes ago"
            color="bg-green-500"
          />
          <ActivityItem
            text="Tab switch detected for Casey Brown"
            time="12 minutes ago"
            color="bg-red-500"
          />
          <ActivityItem
            text="Jamie Chen started Data Structures exam"
            time="18 minutes ago"
            color="bg-blue-500"
          />
          <ActivityItem
            text="You graded Alex Thompson's submission"
            time="32 minutes ago"
            color="bg-blue-500"
          />
          <ActivityItem
            text="New exam scheduled: Database Systems"
            time="1 hour ago"
            color="bg-blue-500"
          />
        </div>
      </div>

      {/* Performance */}
      <div className="bg-white rounded-2xl p-4 border space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Ангийн гүйцэтгэл</h3>
          <GraduationCap size={18} />
        </div>

        <div className="grid grid-cols-4 gap-4">
          <PerformanceCard title="CS 101" students={45} score={78} />
          <PerformanceCard title="CS 201" students={38} score={82} />
          <PerformanceCard title="CS 301" students={52} score={75} />
          <PerformanceCard title="CS 401" students={31} score={88} />
        </div>
      </div>
    </div>
  );
}
