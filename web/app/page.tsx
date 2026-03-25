import { Button } from "@/components/ui/button";
import Header from "./header/page";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

const Page = () => {
  return (
    <div className="w-screen h-screen mx-auto">
      <Header />
      <p>Web Deployed</p>
      <Link href={"./exam"}>
        <Button className="hover:cursor-pointer">
          Continue to Exam <ChevronRight />
        </Button>
      </Link>
    </div>
  );
};
export default Page;
