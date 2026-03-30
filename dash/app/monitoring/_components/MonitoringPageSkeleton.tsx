import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { monitoringCssVars } from "../_lib/theme";

export function MonitoringPageSkeleton() {
  return (
    <div
      className="min-h-screen bg-[var(--monitoring-page-bg)] p-6"
      style={monitoringCssVars}>
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-10 w-64 bg-[var(--monitoring-dark-soft)]" />
            <Skeleton className="h-5 w-80 bg-[var(--monitoring-dark-soft)]" />
          </div>

          <Skeleton className="h-10 w-full bg-[var(--monitoring-dark-soft)] lg:w-[320px]" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={index}
              className="rounded-2xl border-[var(--monitoring-dark-border)] bg-white shadow-sm">
              <CardContent className="flex items-center gap-4 p-6">
                <Skeleton className="h-16 w-16 rounded-2xl bg-[var(--monitoring-dark-soft)]" />

                <div className="space-y-2">
                  <Skeleton className="h-8 w-16 bg-[var(--monitoring-dark-soft)]" />
                  <Skeleton className="h-4 w-28 bg-[var(--monitoring-dark-soft)]" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="rounded-2xl border-[var(--monitoring-dark-border)] bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48 bg-[var(--monitoring-dark-soft)]" />
                <Skeleton className="h-4 w-40 bg-[var(--monitoring-dark-soft)]" />
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                <Skeleton className="h-10 w-full bg-[var(--monitoring-dark-soft)] sm:w-[320px]" />
                <Skeleton className="h-10 w-full bg-[var(--monitoring-dark-soft)] sm:w-[220px]" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Card
                  key={index}
                  className="rounded-2xl border-[var(--monitoring-dark-border)] bg-white shadow-sm">
                  <CardContent className="p-5">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <Skeleton className="h-12 w-12 rounded-full bg-[var(--monitoring-dark-soft)]" />

                        <div className="space-y-2">
                          <Skeleton className="h-6 w-36 bg-[var(--monitoring-dark-soft)]" />
                          <Skeleton className="h-4 w-40 bg-[var(--monitoring-dark-soft)]" />
                        </div>
                      </div>

                      <Skeleton className="h-8 w-20 rounded-full bg-[var(--monitoring-dark-soft)]" />
                    </div>

                    <div className="mb-5 flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded-full bg-[var(--monitoring-dark-soft)]" />
                      <Skeleton className="h-4 w-16 bg-[var(--monitoring-dark-soft)]" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-10 bg-[var(--monitoring-dark-soft)]" />
                        <Skeleton className="h-4 w-24 bg-[var(--monitoring-dark-soft)]" />
                      </div>

                      <Skeleton className="h-2 w-full rounded-full bg-[var(--monitoring-dark-soft)]" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
