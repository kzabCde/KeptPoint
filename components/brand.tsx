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
      src="/keptpoint-mark.webp"
      alt=""
      width={size}
      height={size}
      priority={priority}
      className={cn("shrink-0 rounded-[22%] object-contain shadow-sm", className)}
    />
  );
}

export function BrandWordmark({
  compact = false,
  className = "",
  priority = false,
}: {
  compact?: boolean;
  className?: string;
  priority?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center rounded-lg bg-white px-1.5 py-1", className)}>
      <Image
        src="/keptpoint-wordmark.webp"
        alt="KeptPoint"
        width={360}
        height={80}
        priority={priority}
        className={cn("h-auto object-contain", compact ? "w-[112px]" : "w-[142px]")}
      />
    </span>
  );
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
      <BrandMark size={compact ? 36 : 44} priority />
      <BrandWordmark compact={compact} priority />
    </div>
  );
}
