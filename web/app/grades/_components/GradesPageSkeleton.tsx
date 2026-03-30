import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function GradesPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="space-y-3 pb-2">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="mt-5">
              <div className="space-y-4 rounded-lg border border-dashed p-4">
                <Skeleton className="h-48 w-full" />
                {index === 0 ? (
                  <div className="flex justify-between gap-2">
                    {Array.from({ length: 6 }).map((_, tick) => (
                      <Skeleton key={tick} className="h-3 w-10" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, row) => (
                      <div key={row} className="flex items-center gap-3">
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-5 flex-1" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-44" />
        </CardHeader>
        <CardContent className="mt-5 space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-lg border p-4 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-5 w-44" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-14" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-px w-full" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, row) => (
                  <div key={row} className="grid grid-cols-6 gap-3">
                    <Skeleton className="h-4 col-span-2" />
                    <Skeleton className="h-4" />
                    <Skeleton className="h-4" />
                    <Skeleton className="h-4" />
                    <Skeleton className="h-4" />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between rounded-lg bg-secondary/30 p-3">
                <Skeleton className="h-4 w-24" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-2 w-24" />
                  <Skeleton className="h-5 w-12" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-72 max-w-full" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="mt-5 flex justify-center">
          <div className="w-full max-w-md rounded-lg border border-dashed p-6">
            <Skeleton className="mx-auto h-64 w-64 rounded-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
