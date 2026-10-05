"use client";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(()=>{ console.error(error); },[error]);
  return <main className="mx-auto min-h-dvh max-w-xl px-5 py-10"><div className="rounded-[28px] border border-red-200 bg-white p-6 dark:border-red-950 dark:bg-zinc-950"><p className="text-sm font-semibold text-red-700 dark:text-red-300">PumpPoint</p><h1 className="mt-2 text-2xl font-semibold">Something went wrong</h1><p className="mt-2 break-words text-sm leading-6 text-zinc-500">Please try again. If the problem continues, return to the previous page and verify the information you entered.</p><button onClick={reset} className="mt-5 h-11 rounded-2xl bg-emerald-600 px-5 font-semibold text-white dark:bg-emerald-400 dark:text-emerald-950">Try again</button></div></main>;
}
