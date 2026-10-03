import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ProgramCardProps {
  name: string;
  subtitle: string;
  balance?: number;
  stamps?: { current: number; required: number };
}

export function ProgramCard({ name, subtitle, balance, stamps }: ProgramCardProps) {
  return (
    <Card className="overflow-hidden p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500">{subtitle}</p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight">{name}</h3>
        </div>
        <ArrowUpRight className="size-5 text-zinc-400" />
      </div>
      {typeof balance === "number" && <p className="mt-8 text-3xl font-semibold tracking-[-0.04em]">{balance.toLocaleString()} <span className="text-sm font-medium text-zinc-500">pts</span></p>}
      {stamps && (
        <div className="mt-7">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: stamps.required }).map((_, index) => (
              <span key={index} className={`size-5 rounded-full border ${index < stamps.current ? "border-zinc-950 bg-zinc-950 dark:border-white dark:bg-white" : "border-zinc-300 dark:border-zinc-700"}`} />
            ))}
          </div>
          <p className="mt-3 text-sm text-zinc-500">{stamps.current} / {stamps.required} stamps</p>
        </div>
      )}
    </Card>
  );
}
