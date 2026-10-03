import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-[24px] border border-zinc-200/90 bg-white shadow-sm shadow-emerald-950/[.025] dark:border-zinc-800 dark:bg-zinc-950", className)} {...props} />;
}
