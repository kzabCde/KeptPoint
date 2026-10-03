import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createProgram } from "@/app/actions/loyalty";
import { getLocale } from "@/lib/preferences";
import { messages } from "@/lib/i18n";

export const metadata = { title: "Create program" };

export default async function NewProgramPage() {
  const locale = await getLocale();
  const m = messages[locale].programNew;
  return (
    <main className="mx-auto min-h-dvh max-w-xl px-5 py-6">
      <Link href="/home" className="inline-flex size-10 items-center justify-center rounded-full border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"><ArrowLeft className="size-4"/></Link>
      <div className="mt-6"><p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{m.step}</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">{m.title}</h1><p className="mt-2 text-sm leading-6 text-zinc-500">{m.description}</p></div>
      <form action={createProgram} className="mt-8 grid gap-5">
        <label className="grid gap-2 text-sm font-medium">{m.name}<input name="name" required minLength={2} maxLength={80} className="h-12 rounded-2xl border border-zinc-200 bg-white px-4 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900" placeholder="Kept Coffee"/></label>
        <label className="grid gap-2 text-sm font-medium">{m.slug}<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" className="h-12 rounded-2xl border border-zinc-200 bg-white px-4 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900" placeholder="kept-coffee"/></label>
        <label className="grid gap-2 text-sm font-medium">{m.type}<select name="programType" className="h-12 rounded-2xl border border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900"><option value="points">{m.points}</option><option value="stamps">{m.stampCard}</option><option value="hybrid">{m.hybrid}</option></select></label>
        <label className="grid gap-2 text-sm font-medium">{m.visibility}<select name="visibility" className="h-12 rounded-2xl border border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900"><option value="public">{m.public}</option><option value="private">{m.private}</option><option value="invite_only">{m.inviteOnly}</option></select></label>
        <label className="grid gap-2 text-sm font-medium">{m.descriptionLabel}<textarea name="description" maxLength={500} rows={4} className="rounded-2xl border border-zinc-200 bg-white p-4 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900" placeholder={m.descriptionPlaceholder}/></label>
        <button className="h-12 rounded-2xl bg-emerald-600 font-semibold text-white dark:bg-emerald-400 dark:text-emerald-950">{m.create}</button>
      </form>
    </main>
  );
}
