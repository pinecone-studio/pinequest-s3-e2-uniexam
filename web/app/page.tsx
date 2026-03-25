import Header from "./header/page";
import UpcomingExams from "./_components/UpcomingExams";
import RecentResults from "./_components/RecentResults";

const Page = () => {
  return (
    <div className="w-screen h-screen mx-auto">
      <Header />
      <UpcomingExams/>
      <RecentResults/>
    </div>
  );
};
export default Page;
