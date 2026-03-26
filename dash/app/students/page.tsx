import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StudentTable from "./_components/StudentTable";
const page = () => {
  return (
    <div className="p-6 lg:p-8 bg-gray-50/50">
      {" "}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-foreground">Students</h1>
        <p className="mt-1 text-muted-foreground">
          View student performance and exam history
        </p>
      </div>
      <div className="flex items-center justify-between ">
        <div className="flex items-center gap-4">
          <Input className="w-48" placeholder="Search students..." />

          <Select>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              side="bottom"
              align="start"
              sideOffset={4}
            >
              <SelectGroup>
                <SelectLabel>All courses</SelectLabel>
                <SelectItem value="apple">CS 101</SelectItem>
                <SelectItem value="banana">CS 102</SelectItem>
                <SelectItem value="blueberry">CS 201</SelectItem>
                <SelectItem value="grapes">CS 202</SelectItem>
                <SelectItem value="pineapple">CS 301</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <span className="text-sm text-gray-500 font-medium">
          Showing 8 of 8 students
        </span>
      </div>
      <div className="pt-8">
        <StudentTable></StudentTable>
      </div>
    </div>
  );
};

export default page;
