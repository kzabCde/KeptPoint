import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createReward } from "@/app/actions/loyalty";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/preferences";
import { messages } from "@/lib/i18n";

export default async function RewardsAdminPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const m = messages[locale].rewardsAdmin;
  const supabase = await createClient();
  const { data: program } = await supabase.from("programs").select("id,name").eq("slug", slug).single();
  const { data: rewards } = program ? await supabase.from("rewards").select("id,name,reward_type,points_required,stamps_required,stock,active").eq("program_id", program.id).order("created_at", { ascending: false }) : { data: [] };
  if (!program) return <main className="p-6">{m.notFound}</main>;
  return <main className="mx-auto min-h-dvh max-w-5xl px-5 py-6 lg:px-8 lg:py-8"><Link href={`/programs/${slug}/manage`} className="inline-flex size-10 items-center justify-center rounded-full border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"><ArrowLeft className="size-4"/></Link><h1 className="mt-7 text-3xl font-semibold tracking-[-0.04em]">{m.title}</h1><form action={createReward} className="mt-6 grid gap-3 rounded-[24px] border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"><input type="hidden" name="programId" value={program.id}/><input type="hidden" name="slug" value={slug}/><input name="name" required maxLength={100} placeholder={m.namePlaceholder} className="h-12 rounded-xl border border-zinc-200 bg-transparent px-4 outline-none focus:border-emerald-500 dark:border-zinc-800"/><textarea name="description" maxLength={500} placeholder={m.descriptionPlaceholder} className="rounded-xl border border-zinc-200 bg-transparent p-4 outline-none focus:border-emerald-500 dark:border-zinc-800"/><div className="grid grid-cols-2 gap-3"><select name="rewardType" className="h-12 rounded-xl border border-zinc-200 bg-transparent px-3 dark:border-zinc-800"><option value="points">{m.points}</option><option value="stamps">{m.stamps}</option><option value="free">{m.free}</option><option value="manual">{m.manual}</option></select><input name="cost" type="number" min="1" placeholder={m.cost} className="h-12 rounded-xl border border-zinc-200 bg-transparent px-4 outline-none focus:border-emerald-500 dark:border-zinc-800"/></div><input name="stock" type="number" min="0" placeholder={m.stock} className="h-12 rounded-xl border border-zinc-200 bg-transparent px-4 outline-none focus:border-emerald-500 dark:border-zinc-800"/><PendingSubmitButton pendingLabel={locale === "th" ? "กำลังเพิ่ม…" : "Adding…"} className="h-12 rounded-xl bg-emerald-600 font-semibold text-white dark:bg-emerald-400 dark:text-emerald-950">{m.add}</PendingSubmitButton></form><div className="mt-6 grid gap-3">{(rewards ?? []).map((reward)=><div key={reward.id} className="rounded-[22px] border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"><div className="flex items-center justify-between gap-3"><div><p className="font-semibold">{reward.name}</p><p className="mt-1 text-sm text-zinc-500">{reward.reward_type} · {reward.points_required ?? reward.stamps_required ?? m.manual}</p></div><span className="text-xs text-zinc-500">{reward.stock == null ? m.unlimited : `${reward.stock} ${m.left}`}</span></div></div>)}</div></main>;
}
