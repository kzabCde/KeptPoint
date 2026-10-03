import Image from "next/image";
import { cn } from "@/lib/utils";

export function Brand({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <Image src="/keptpoint-mark.svg" alt="KeptPoint" width={compact ? 36 : 44} height={compact ? 36 : 44} priority className="rounded-[12px] shadow-sm" />
      <span className={cn("font-semibold tracking-[-0.045em]", compact ? "text-lg" : "text-xl")}>
        <span className="text-zinc-950 dark:text-white">Kept</span><span className="text-emerald-600 dark:text-emerald-400">Point</span>
      </span>
    </div>
  );
}
