import { Camera, QrCode } from "lucide-react";
import { acceptQrToken } from "@/app/actions/loyalty";
import { getLocale } from "@/lib/preferences";
import { messages } from "@/lib/i18n";

export const metadata = { title: "Scan" };

export default async function ScanPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  const locale = await getLocale();
  const m = messages[locale].scan;
  return (
    <main className="px-5 py-6">
      <h1 className="text-3xl font-semibold tracking-[-0.04em]">{m.title}</h1>
      <p className="mt-2 text-sm leading-6 text-zinc-500">{m.description}</p>
      <div className="mt-8 aspect-square rounded-[32px] border border-emerald-900/20 bg-[radial-gradient(circle_at_top,#0a5d50,#062f2a_62%)] p-4 shadow-xl shadow-emerald-950/10">
        <div className="grid h-full place-items-center rounded-[24px] border border-dashed border-emerald-200/25"><div className="text-center text-white"><QrCode className="mx-auto size-14 text-emerald-300"/><p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-white/70">{m.cameraHint}</p></div></div>
      </div>
      <form action={acceptQrToken} className="mt-5 grid gap-3">
        <input name="token" defaultValue={token} required minLength={16} maxLength={256} placeholder={m.paste} className="h-12 rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900"/>
        <button className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 font-semibold text-white dark:bg-emerald-400 dark:text-emerald-950"><Camera className="size-4"/>{m.accept}</button>
      </form>
      <p className="mt-5 rounded-2xl bg-emerald-50 p-4 text-xs leading-5 text-emerald-950/70 dark:bg-emerald-950/30 dark:text-emerald-100/70">{m.security}</p>
    </main>
  );
}
