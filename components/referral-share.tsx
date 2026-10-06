"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";

export function ReferralShare({
  path,
  copyLabel,
  shareLabel,
  copiedLabel,
}: {
  path: string;
  copyLabel: string;
  shareLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  function absoluteUrl() {
    return new URL(path, window.location.origin).toString();
  }

  async function copy() {
    await navigator.clipboard.writeText(absoluteUrl());
    setCopied(true);
  }

  async function share() {
    const url = absoluteUrl();
    if (navigator.share) {
      try {
        await navigator.share({ title: "PumpPoint Referral", url });
        return;
      } catch {
        return;
      }
    }
    await copy();
  }

  return (
    <div className="mt-3 grid gap-2">
      <code className="block min-w-0 truncate rounded-xl bg-white/80 px-3 py-2 text-[11px] text-zinc-600 dark:bg-white/5 dark:text-zinc-300">{path}</code>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={copy} className="cute-secondary inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-bold">
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? copiedLabel : copyLabel}
        </button>
        <button type="button" onClick={share} className="cute-secondary inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-bold">
          <Share2 className="size-3.5" />{shareLabel}
        </button>
      </div>
    </div>
  );
}
