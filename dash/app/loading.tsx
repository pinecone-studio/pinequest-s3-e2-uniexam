import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-2 animate-spin rounded-full border-[3px] border-blue-100 border-t-[#2658c4]" />
          <div className="absolute flex h-10 w-10 items-center justify-center rounded-full bg-white">
            <LoaderCircle className="h-5 w-5 animate-spin text-[#2658c4]" />
          </div>
        </div>

        <p className="text-xs font-medium tracking-wide text-slate-500">
          Түр хүлээнэ үү
        </p>
      </div>
    </div>
  );
}
