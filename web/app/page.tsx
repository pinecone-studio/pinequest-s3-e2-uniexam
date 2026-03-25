"use client";
import { useAuth } from "@clerk/nextjs";

const Page = () => {
  const { userId } = useAuth();
  console.log({ userId });

  return (
    <div className="w-screen h-screen mx-auto">
      <p>Web Deployed</p>
    </div>
  );
};

export default Page;
