import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Clock } from "lucide-react";

const ExamTimer = () => {
  return (
    <div>
      <Card className="flex flex-col gap-6 rounded-xl py-6 mb-6 justify-center w-full">
        <CardHeader className="flex gap-2 justify-center items-center">
          <Clock size={16} />
          <p>Time Remaining</p>
        </CardHeader>
        <CardContent className="justify-center ">
          <p>Running Time</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamTimer;
