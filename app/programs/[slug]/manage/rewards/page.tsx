import Link from "next/link";
import { ArrowLeft, Stamp } from "lucide-react";
import { createReward } from "@/app/actions/loyalty";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/preferences";
import { messages } from "@/lib/i18n";

export default async function RewardsAdminPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const th = locale === "th";
  const m = messages[locale].rewardsAdmin;
  const supabase = await createClient();
  const { data: program } = await supabase.from("programs").select("id,name,program_type,point_redemption_enabled").eq("slug", slug).single();
  const { data: rewards } = program ? await supabase.from("rewards").select("id,name,reward_type,points_required,stamps_required,stock,active,stamp_card_id").eq("program_id", program.id).order("created_at", { ascending: false }) : { data: [] };
  if (!program) return <main className="p-6">{m.notFound}</main>;
  const pointRewards = (rewards ?? []).filter((reward) => reward.reward_type !== "stamps");
  const stampRewards = (rewards ?? []).filter((reward) => reward.reward_type === "stamps");
  const canCreatePointReward = program.program_type !== "stamps" && program.point_redemption_enabled;

  return <main className="mx-auto min-h-dvh max-w-5xl px-5 py-6 lg:px-8 lg:py-8"><Link href={`/programs/${slug}/manage`} className="inline-flex size-10 items-center justify-center rounded-full border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"><ArrowLeft className="size-4"/></Link><h1 className="mt-7 text-3xl font-semibold tracking-[-0.04em]">{m.title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">{th ? "Rewards หน้านี้ใช้สำหรับสิทธิ์ที่แลกด้วย Points หรือสิทธิ์แบบ manual/free เท่านั้น ส่วนสิทธิ์จาก Stamp Card ต้องตั้งค่าที่หน้า Loyalty ของบัตรนั้นโดยตรง" : "This page manages point, manual, and free rewards only. Stamp-card perks are configured directly on their stamp card in Loyalty settings."}</p>

  {canCreatePointReward ? <form action={createReward} className="mt-6 grid gap-3 rounded-[24px] border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"><input type="hidden" name="programId" value={program.id}/><input type="hidden" name="slug" value={slug}/><input name="name" required maxLength={100} placeholder={m.namePlaceholder} className="h-12 rounded-xl border border-zinc-200 bg-transparent px-4 outline-none focus:border-emerald-500 dark:border-zinc-800"/><textarea name="description" maxLength={500} placeholder={m.descriptionPlaceholder} className="rounded-xl border border-zinc-200 bg-transparent p-4 outline-none focus:border-emerald-500 dark:border-zinc-800"/><div className="grid grid-cols-2 gap-3"><select name="rewardType" className="h-12 rounded-xl border border-zinc-200 bg-transparent px-3 dark:border-zinc-800"><option value="points">{m.points}</option><option value="free">{m.free}</option><option value="manual">{m.manual}</option></select><input name="cost" type="number" min="1" placeholder={th ? "จำนวนแต้มที่ใช้ (สำหรับ Points reward)" : "Point cost (for point rewards)"} className="h-12 rounded-xl border border-zinc-200 bg-transparent px-4 outline-none focus:border-emerald-500 dark:border-zinc-800"/></div><input name="stock" type="number" min="0" placeholder={m.stock} className="h-12 rounded-xl border border-zinc-200 bg-transparent px-4 outline-none focus:border-emerald-500 dark:border-zinc-800"/><PendingSubmitButton pendingLabel={locale === "th" ? "กำลังเพิ่ม…" : "Adding…"} className="h-12 rounded-xl bg-emerald-600 font-semibold text-white dark:bg-emerald-400 dark:text-emerald-950">{m.add}</PendingSubmitButton></form> : <div className="mt-6 rounded-[22px] border border-dashed border-zinc-300 p-5 text-sm text-zinc-500 dark:border-zinc-700">{th ? "ร้านนี้ไม่ได้เปิดการใช้ Points แลกรางวัล หากต้องการสร้าง Point Reward ให้เปิดตัวเลือกนี้ที่ Loyalty > Points" : "Point redemption is disabled for this store. Enable it under Loyalty > Points to create point rewards."}</div>}

  <section className="mt-7"><h2 className="font-semibold">{th ? "Point / General rewards" : "Point / general rewards"}</h2><div className="mt-3 grid gap-3">{pointRewards.length === 0 && <p className="text-sm text-zinc-500">{th ? "ยังไม่มี Reward" : "No rewards yet."}</p>}{pointRewards.map((reward)=><div key={reward.id} className="rounded-[22px] border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"><div className="flex items-center justify-between gap-3"><div><p className="font-semibold">{reward.name}</p><p className="mt-1 text-sm text-zinc-500">{reward.reward_type} · {reward.points_required ?? m.manual}</p></div><span className="text-xs text-zinc-500">{reward.stock == null ? m.unlimited : `${reward.stock} ${m.left}`}</span></div></div>)}</div></section>

  {stampRewards.length > 0 && <section className="mt-8 rounded-[24px] border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-900/50 dark:bg-amber-950/20"><div className="flex items-center gap-2"><Stamp className="size-4 text-amber-700"/><h2 className="font-semibold">{th ? "สิทธิ์จาก Stamp Card" : "Stamp-card perks"}</h2></div><p className="mt-2 text-xs leading-5 text-zinc-500">{th ? "รายการเหล่านี้ผูกกับบัตรสแตมป์โดยตรง และแก้ไขจาก Loyalty settings เพื่อป้องกันการนำสแตมป์จากคนละบัตรมาแลกผิด" : "These perks are bound to specific stamp cards and edited from Loyalty settings so stamps from another card cannot be used by mistake."}</p><div className="mt-4 grid gap-2">{stampRewards.map((reward) => <div key={reward.id} className="rounded-xl bg-white/70 p-3 dark:bg-black/10"><p className="font-semibold">{reward.name}</p><p className="mt-1 text-xs text-zinc-500">{reward.stamps_required} stamps · card {reward.stamp_card_id?.slice(0,8)}</p></div>)}</div></section>}
  </main>;
}
