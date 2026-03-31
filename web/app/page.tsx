import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const { userId } = await auth();

  redirect(userId ? "/dashboard" : "/sign-in");
}

// import UpcomingExams from "./_components/UpcomingExams";
// import RecentResults from "./_components/RecentResults";
// import { MyCourses } from "./_components/MyCourses";

// const Page = () => {
//   return (
//     <div className="min-h-screen w-full flex bg-background">
//       {/* <Header /> */}
//       {/* <Sidebar /> */}

//       <div className="mx-14 mt-8 grid grid-cols-12 gap-10 items-start">
//         <div className="col-span-3">
//           <MyCourses />
//         </div>

//         <div className="col-span-9 space-y-10">
//           <UpcomingExams />
//           <RecentResults />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Page;
