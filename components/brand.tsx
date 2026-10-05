import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandMark({
  className = "",
  size = 44,
  priority = false,
}: {
  className?: string;
  size?: number;
  priority?: boolean;
}) {
  return (
    <Image
      src="/pumppoint-mark.svg"
      alt="PumpPoint"
      width={size}
      height={size}
      priority={priority}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}

export function BrandWordmark({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  return <span className={cn("inline-flex items-baseline font-extrabold tracking-[-0.055em] text-[#0F2D46] dark:text-white", compact ? "text-xl" : "text-[28px]", className)}><span>Pump</span><span className="text-[#10C9A7]">Point</span></span>;
}

export function Brand({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark size={compact ? 36 : 46} priority />
      <BrandWordmark compact={compact} />
    </div>
  );
}
