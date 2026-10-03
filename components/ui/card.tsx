import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-[24px] border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950", className)} {...props} />;
}
