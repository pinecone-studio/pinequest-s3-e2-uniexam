"use client";
import { getToken, useAuth, useUser } from "@clerk/nextjs";

const Page = () => {
  const { userId } = useAuth();
  // const token = getToken();
  // console.log({ token });
  console.log({ userId });

  return (
    <div className="w-screen h-screen mx-auto">
      <p>setup checked</p>
    </div>
  );
};

export default Page;
