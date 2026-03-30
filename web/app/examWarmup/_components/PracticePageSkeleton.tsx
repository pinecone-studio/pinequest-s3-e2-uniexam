import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PracticePageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="rounded-lg bg-secondary/30 p-4">
            <Skeleton className="mb-3 h-4 w-32" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>

          <Skeleton className="h-11 w-full bg-[#006d77]/15" />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="space-y-3 pb-2">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-24" />
              {index === 1 ? <Skeleton className="h-2 w-full" /> : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
