import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition active:scale-[.98] disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950",
        variant === "secondary" && "border border-zinc-200 bg-white text-zinc-950 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white",
        variant === "ghost" && "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900",
        className,
      )}
      {...props}
    />
  );
}
