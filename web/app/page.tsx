import Header from "./header/page";

const Page = () => {
  return (
    <div className="w-screen h-screen mx-auto">
      <Header />
      <p>Web Deployed</p>
      <Button
        className="hover:cursor-pointer"
        onClick={() => router.push("./exam")}
      >
        Continue to Exam <ChevronRight />
      </Button>
    </div>
  );
};

export default Page;
