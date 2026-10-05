import Link from "next/link";
import { ArrowLeft, CheckCircle2, Gift, LockKeyhole, QrCode, Settings2, Sparkles } from "lucide-react";
import { joinProgram, redeemReward } from "@/app/actions/loyalty";
import { StampGrid } from "@/components/stamp-grid";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/preferences";
import { messages } from "@/lib/i18n";
import { getRewardState, rewardProgress } from "@/lib/reward-state";

export default async function ProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const th = locale === "th";
  const m = messages[locale].program;
  const c = messages[locale].common;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const { data: program } = await supabase.from("programs").select("id,owner_id,name,description,program_type,currency_name").eq("slug", slug).maybeSingle();
  if (!program) return <main className="mx-auto max-w-5xl p-6">{m.notFound}</main>;

  const userId = auth.user?.id;
  const [memberResult, accountResult, stampResult, rewardsResult, redemptionsResult] = await Promise.all([
    userId ? supabase.from("program_members").select("status").eq("program_id", program.id).eq("user_id", userId).maybeSingle() : Promise.resolve({ data: null }),
    userId ? supabase.from("point_accounts").select("balance,reserved_balance").eq("program_id", program.id).eq("user_id", userId).maybeSingle() : Promise.resolve({ data: null }),
    userId ? supabase.from("stamp_progress").select("stamp_count,status,stamp_cards(required_stamps)").eq("program_id", program.id).eq("user_id", userId).in("status", ["active","completed","reserved"]).order("round", { ascending: false }).limit(1).maybeSingle() : Promise.resolve({ data: null }),
    supabase.from("rewards").select("id,name,description,reward_type,points_required,stamps_required,stock,max_per_user").eq("program_id", program.id).eq("active", true).order("created_at"),
    userId ? supabase.from("reward_redemptions").select("reward_id,status").eq("program_id", program.id).eq("user_id", userId).order("created_at", { ascending: false }) : Promise.resolve({ data: [] }),
  ]);

  const member = memberResult.data;
  const account = accountResult.data;
  const stamp = stampResult.data;
  const rewards = rewardsResult.data ?? [];
  const redemptions = redemptionsResult.data ?? [];
  const canManage = userId === program.owner_id;
  const stampCard = stamp ? (Array.isArray(stamp.stamp_cards) ? stamp.stamp_cards[0] : stamp.stamp_cards) : null;
  const availableBalance = Math.max(0, Number(account?.balance ?? 0) - Number(account?.reserved_balance ?? 0));
  const stampCount = Number(stamp?.stamp_count ?? 0);
  const requiredStamps = Number(stampCard?.required_stamps ?? 0);
  const remainingStamps = requiredStamps ? Math.max(0, requiredStamps - stampCount) : null;

  return (
    <main className="mx-auto min-h-dvh max-w-5xl px-5 py-6 sm:px-8 lg:py-10">
      <div className="flex items-center justify-between gap-3">
        <Link href="/wallet" aria-label={th ? "กลับวอลเล็ต" : "Back to wallet"} className="cute-icon-button"><ArrowLeft className="size-4"/></Link>
        {canManage && <Link href={`/programs/${slug}/manage`} className="cute-secondary inline-flex min-h-11 items-center gap-2 rounded-2xl px-4 text-sm font-semibold"><Settings2 className="size-4"/>{c.manage}</Link>}
      </div>

      <section className="loyalty-card mt-7 p-6 lg:p-8">
        <div className="flex items-start gap-4"><div className="grid size-16 shrink-0 place-items-center rounded-[22px] bg-[#0F2D46] text-2xl font-bold text-white shadow-lg shadow-emerald-950/10">{program.name.slice(0,1).toUpperCase()}</div><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[.1em] text-emerald-700 dark:text-emerald-300">{program.program_type}</p><h1 className="mt-1 break-words text-3xl font-semibold tracking-[-0.045em]">{program.name}</h1><p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{program.description || m.fallbackDescription}</p></div></div>

        {member?.status === "active" ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {(program.program_type === "points" || program.program_type === "hybrid") && <div className="rounded-[22px] bg-white/60 p-4 dark:bg-white/5"><p className="text-xs font-semibold text-zinc-500">{m.available}</p><p className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-emerald-700 dark:text-emerald-300">{availableBalance.toLocaleString(th ? "th-TH" : "en-US")}</p><p className="text-xs font-medium text-zinc-500">{program.currency_name}</p></div>}
            {(program.program_type === "stamps" || program.program_type === "hybrid") && requiredStamps > 0 && <div className="rounded-[22px] bg-white/60 p-4 dark:bg-white/5"><div className="flex items-center justify-between"><p className="text-xs font-semibold text-zinc-500">{m.stampCard}</p><span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{stampCount}/{requiredStamps}</span></div><StampGrid current={stampCount} required={requiredStamps} compact className="mt-3"/><p className="mt-3 text-xs text-zinc-500">{remainingStamps === 0 ? (th ? "ครบแล้ว พร้อมรับรางวัล 🎉" : "Complete — reward ready 🎉") : remainingStamps !== null && remainingStamps <= 2 ? (th ? `อีก ${remainingStamps} สแตมป์เท่านั้น ✨` : `Only ${remainingStamps} stamps left ✨`) : stamp?.status ?? m.active}</p></div>}
          </div>
        ) : (
          <form action={joinProgram.bind(null, program.id)} className="mt-6"><button className="cute-primary h-12 w-full rounded-2xl font-semibold">{m.join}</button></form>
        )}
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-3"><div><div className="flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-300"><Sparkles className="size-4"/>{th ? "ของดีที่รออยู่" : "Something to look forward to"}</div><h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">{m.rewards}</h2></div><span className="grid size-12 place-items-center rounded-[18px] bg-reward-soft text-amber-700 dark:text-amber-200"><Gift className="size-6"/></span></div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {rewards.length === 0 && <div className="cute-card p-6 text-center shadow-none"><Gift className="mx-auto size-7 text-amber-500"/><p className="mt-3 font-semibold">{m.noRewards}</p><p className="mt-1 text-sm text-zinc-500">{th ? "ร้านยังไม่ได้เพิ่มรางวัล กลับมาเช็กอีกทีนะ" : "This program has not added rewards yet. Check back soon."}</p></div>}
          {rewards.map((reward) => {
            const pending = redemptions.some((r) => r.reward_id === reward.id && (r.status === "pending" || r.status === "reserved"));
            const completedCount = redemptions.filter((r) => r.reward_id === reward.id && r.status === "completed").length;
            const exhaustedForUser = reward.max_per_user !== null && completedCount >= reward.max_per_user;
            const state = getRewardState({ rewardType: reward.reward_type, pointsRequired: reward.points_required, stampsRequired: reward.stamps_required, stock: reward.stock, balance: availableBalance, stamps: stampCount });
            const current = reward.reward_type === "stamps" ? stampCount : availableBalance;
            const required = reward.reward_type === "stamps" ? reward.stamps_required : reward.points_required;
            const progress = rewardProgress(current, required);
            const action = redeemReward.bind(null, reward.id);
            const cost = reward.reward_type === "points" ? `${reward.points_required} ${c.points}` : reward.reward_type === "stamps" ? `${reward.stamps_required} ${c.stamps}` : m.manual;
            const disabled = member?.status !== "active" || pending || exhaustedForUser || state === "locked" || state === "out-of-stock";
            const stateLabel = pending ? (th ? "กำลังรอรับรางวัล" : "Pending") : exhaustedForUser ? (th ? "แลกครบสิทธิ์แล้ว" : "Redeemed") : state === "out-of-stock" ? (th ? "หมดชั่วคราว" : "Out of stock") : state === "available" ? (th ? "พร้อมแลก ✨" : "Ready ✨") : state === "almost" ? (th ? "ใกล้แล้ว!" : "Almost there!") : (th ? "สะสมต่ออีกนิด" : "Keep collecting");
            const tone = state === "available" && !pending ? "border-amber-300 bg-[linear-gradient(145deg,var(--reward-soft),var(--surface))] dark:border-amber-800" : "border-[var(--border)] bg-[var(--surface)]";
            return <form action={action} key={reward.id} className={`rounded-[24px] border p-5 shadow-sm ${tone}`}><div className="flex min-w-0 items-start gap-3"><div className={`grid size-12 shrink-0 place-items-center rounded-[18px] ${state === "available" ? "bg-amber-300 text-amber-950" : state === "almost" ? "bg-lavender-soft text-violet-700 dark:text-violet-200" : "bg-zinc-100 text-zinc-500 dark:bg-white/5"}`}>{state === "locked" ? <LockKeyhole className="size-5"/> : state === "available" ? <Sparkles className="size-5"/> : <Gift className="size-5"/>}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="break-words font-semibold">{reward.name}</p><span className="rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-bold text-zinc-600 dark:bg-white/10 dark:text-zinc-200">{stateLabel}</span></div><p className="mt-1 break-words text-sm leading-6 text-zinc-500">{reward.description || cost}</p><p className="mt-2 text-xs font-bold">{cost}{reward.stock == null ? "" : ` · ${reward.stock} ${m.left}`}</p>{required && required > 0 && <div className="mt-3"><div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress}%` }}/></div><p className="mt-1.5 text-[11px] text-zinc-500">{current}/{required}</p></div>}</div></div>{member?.status === "active" && <button disabled={disabled} className={`mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold transition ${disabled ? "cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-white/5" : "bg-amber-300 text-amber-950 hover:bg-amber-200"}`}>{state === "available" && !pending && !exhaustedForUser ? <CheckCircle2 className="size-4"/> : <Gift className="size-4"/>}{pending ? (th ? "รอยืนยันการแลก" : "Awaiting confirmation") : exhaustedForUser ? (th ? "แลกครบแล้ว" : "Redeemed") : m.redeem}</button>}</form>;
          })}
        </div>
      </section>

      <Link href="/scan" className="cute-secondary mt-6 flex min-h-12 items-center justify-center gap-2 rounded-2xl p-4 text-sm font-semibold"><QrCode className="size-4 text-emerald-600"/>{m.scan}</Link>
    </main>
  );
}
