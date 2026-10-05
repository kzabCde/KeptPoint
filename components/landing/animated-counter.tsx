"use client";

import { useEffect, useRef, useState } from "react";

export function AnimatedCounter({ value, duration = 900, formatter, className }: { value: number; duration?: number; formatter?: (value: number) => string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || started) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setStarted(true);
      observer.disconnect();
      if (reduced) {
        setCount(value);
        return;
      }
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(value * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.45 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [duration, started, value]);

  return <span ref={ref} className={className}>{formatter ? formatter(count) : count.toLocaleString()}</span>;
}
