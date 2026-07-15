import { cn } from "@/lib/utils";

/** Yuklanish paytidagi "skelet" placeholder. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-line/70",
        className,
      )}
    />
  );
}
