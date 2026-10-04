import { Check, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

export function StampGrid({ current, required, compact = false, className }: { current: number; required: number; compact?: boolean; className?: string }) {
  const safeRequired = Math.min(20, Math.max(1, required));
  const safeCurrent = Math.max(0, Math.min(current, safeRequired));
  const remaining = Math.max(0, safeRequired - safeCurrent);

  return (
    <div className={cn("grid gap-2", compact ? "grid-cols-5" : safeRequired <= 8 ? "grid-cols-4" : "grid-cols-5", className)} aria-label={`${safeCurrent} of ${safeRequired} stamps`}>
      {Array.from({ length: safeRequired }, (_, index) => {
        const filled = index < safeCurrent;
        const near = !filled && remaining <= 2;
        const last = index === safeRequired - 1;
        return (
          <span key={index} className={cn("stamp-slot", compact ? "min-w-8" : "min-w-10")} data-filled={filled} data-near={near} aria-hidden="true">
            {filled ? <Check className={compact ? "size-3.5" : "size-4"}/> : last ? <Gift className={compact ? "size-3.5" : "size-4"}/> : <span className="text-[10px] font-bold">{index + 1}</span>}
          </span>
        );
      })}
    </div>
  );
}
