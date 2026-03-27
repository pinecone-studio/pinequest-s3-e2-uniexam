"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function MonitoringPagination({
  currentPage,
  totalPages,
  onPageChange,
}: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Нийт <span className="font-medium text-foreground">{totalPages}</span>{" "}
        хуудас
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          {pages.map((page) => {
            const isActive = page === currentPage;

            return (
              <Button
                key={page}
                variant={isActive ? "default" : "outline"}
                size="icon"
                onClick={() => onPageChange(page)}
                className={isActive ? "bg-blue-600 hover:bg-blue-600" : ""}
              >
                {page}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
