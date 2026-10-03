import { Camera, QrCode } from "lucide-react";
import { acceptQrToken } from "@/app/actions/loyalty";

export const metadata = { title: "Scan" };

export default async function ScanPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return (
    <main className="px-5 py-6">
      <h1 className="text-3xl font-semibold tracking-[-0.04em]">Scan</h1>
      <p className="mt-2 text-sm leading-6 text-zinc-500">Open a Keptpoint QR with your device camera or paste its one-time token here. The server validates the action, creator permission, expiry and replay state.</p>
      <div className="mt-8 aspect-square rounded-[32px] border border-zinc-200 bg-zinc-950 p-4 dark:border-zinc-800">
        <div className="grid h-full place-items-center rounded-[24px] border border-dashed border-white/25"><div className="text-center text-white"><QrCode className="mx-auto size-14"/><p className="mt-4 text-sm text-white/70">In-app camera adapter can be added without changing the token protocol.</p></div></div>
      </div>
      <form action={acceptQrToken} className="mt-5 grid gap-3">
        <input name="token" defaultValue={token} required minLength={16} maxLength={256} placeholder="Paste QR token" className="h-12 rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900"/>
        <button className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-zinc-950 font-semibold text-white dark:bg-white dark:text-zinc-950"><Camera className="size-4"/>Accept QR</button>
      </form>
      <p className="mt-5 rounded-2xl bg-zinc-100 p-4 text-xs leading-5 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">Sensitive QR sessions expire in 15–600 seconds; the default generated session lasts 90 seconds and can be consumed once.</p>
    </main>
  );
}
