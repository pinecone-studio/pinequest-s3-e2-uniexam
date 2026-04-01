import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SearchTabsProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const SearchTabs = ({ value, onValueChange }: SearchTabsProps) => {
  return (
    <Tabs
      defaultValue="all"
      value={value}
      onValueChange={onValueChange}
      className="h-10"
    >
      <TabsList className="gap-2 p-0 h-9">
        <TabsTrigger
          value="all"
          className="data-[state=active]:bg-white border rounded-md px-4 py-1.5"
        >
          Бүх шалгалт
        </TabsTrigger>

        <TabsTrigger value="scheduled">Төлөвлөгдсөн</TabsTrigger>
        <TabsTrigger value="completed">Дууссан</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
