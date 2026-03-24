"use client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";

const Page = () => {
  const { userId } = useAuth();
  console.log({ userId });
  return (
    <div>
      <Button>checking</Button>
    </div>
  );
};

export default Page;
