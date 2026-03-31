import CompletedExams from "../_components/CompletedExams";
import UpcomingExams from "../_components/UpcomingExams";

const ExamsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-14 mt-8">
        <UpcomingExams />
        <CompletedExams />
      </div>
    </div>
  );
};

export default ExamsPage;
