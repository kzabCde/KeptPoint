import Link from "next/link";
import { ArrowLeft, Gift, History, UsersRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/preferences";
import { messages } from "@/lib/i18n";

export default async function ManageProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const m = messages[locale].manage;
  const supabase = await createClient();
  const { data } = await supabase.from("programs").select("id,name,program_type").eq("slug", slug).single();
  const links = [
    [Gift, m.rewards, m.rewardsCopy, `/programs/${slug}/manage/rewards`],
    [History, m.redemptions, m.redemptionsCopy, `/programs/${slug}/manage/redemptions`],
    [UsersRound, m.members, m.membersCopy, "#"],
  ] as const;
  return <main className="mx-auto min-h-dvh max-w-xl px-5 py-6"><Link href={`/programs/${slug}`} className="inline-flex size-10 items-center justify-center rounded-full border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"><ArrowLeft className="size-4"/></Link><p className="mt-7 text-sm font-medium text-emerald-700 dark:text-emerald-300">{m.eyebrow}</p><h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em]">{data?.name ?? slug}</h1><p className="mt-2 text-sm text-zinc-500">{data?.program_type ?? "program"}</p><div className="mt-8 divide-y divide-zinc-200 rounded-[24px] border border-zinc-200 bg-white px-4 dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">{links.map(([Icon,title,copy,href])=><Link key={title} href={href} className="flex gap-4 py-5 transition hover:text-emerald-700 dark:hover:text-emerald-300"><span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"><Icon className="size-5"/></span><div><p className="font-semibold">{title}</p><p className="mt-1 text-sm text-zinc-500">{copy}</p></div></Link>)}</div></main>;
}
