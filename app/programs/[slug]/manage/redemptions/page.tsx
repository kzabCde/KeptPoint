import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { completeRedemption } from "@/app/actions/loyalty";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/preferences";
import { messages } from "@/lib/i18n";

export default async function RedemptionsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const m = messages[locale].redemptions;
  const supabase = await createClient();
  const { data: program } = await supabase.from("programs").select("id,name").eq("slug", slug).single();
  const { data: rows } = program ? await supabase.from("reward_redemptions").select("id,user_id,status,reserved_points,created_at,rewards(name)").eq("program_id", program.id).eq("status", "pending").order("created_at") : { data: [] };
  return <main className="mx-auto min-h-dvh max-w-5xl px-5 py-6 lg:px-8 lg:py-8"><Link href={`/programs/${slug}/manage`} className="inline-flex size-10 items-center justify-center rounded-full border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"><ArrowLeft className="size-4"/></Link><h1 className="mt-7 text-3xl font-semibold tracking-[-0.04em]">{m.title}</h1><div className="mt-6 grid gap-3">{(rows ?? []).length === 0 && <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-500 dark:border-zinc-700">{m.empty}</p>}{(rows ?? []).map((row)=>{const action=completeRedemption.bind(null,row.id,slug); const reward = Array.isArray(row.rewards) ? row.rewards[0] : row.rewards; return <form action={action} key={row.id} className="rounded-[22px] border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"><p className="font-semibold">{reward?.name ?? m.reward}</p><p className="mt-1 text-xs text-zinc-500">{m.member} {row.user_id.slice(0,8)}… · {m.reserved} {row.reserved_points} {m.points}</p><PendingSubmitButton pendingLabel={locale === "th" ? "กำลังยืนยัน…" : "Confirming…"} className="mt-4 h-10 w-full rounded-xl bg-emerald-600 text-sm font-semibold text-white dark:bg-emerald-400 dark:text-emerald-950">{m.confirm}</PendingSubmitButton></form>})}</div></main>;
}
