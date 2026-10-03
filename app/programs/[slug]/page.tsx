import Link from "next/link";
import { ArrowLeft, Gift, QrCode, Settings2 } from "lucide-react";
import { joinProgram, redeemReward } from "@/app/actions/loyalty";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function ProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const { data: program } = await supabase.from("programs").select("id,owner_id,name,description,program_type,currency_name").eq("slug", slug).maybeSingle();
  if (!program) return <main className="mx-auto max-w-xl p-6">Program not found or unavailable.</main>;

  const userId = auth.user?.id;
  const [memberResult, accountResult, stampResult, rewardsResult] = await Promise.all([
    userId ? supabase.from("program_members").select("status").eq("program_id", program.id).eq("user_id", userId).maybeSingle() : Promise.resolve({ data: null }),
    userId ? supabase.from("point_accounts").select("balance,reserved_balance").eq("program_id", program.id).eq("user_id", userId).maybeSingle() : Promise.resolve({ data: null }),
    userId ? supabase.from("stamp_progress").select("stamp_count,status,stamp_cards(required_stamps)").eq("program_id", program.id).eq("user_id", userId).in("status", ["active","completed","reserved"]).order("round", { ascending: false }).limit(1).maybeSingle() : Promise.resolve({ data: null }),
    supabase.from("rewards").select("id,name,description,reward_type,points_required,stamps_required,stock").eq("program_id", program.id).eq("active", true).order("created_at"),
  ]);

  const member = memberResult.data;
  const account = accountResult.data;
  const stamp = stampResult.data;
  const rewards = rewardsResult.data ?? [];
  const canManage = userId === program.owner_id;
  const stampCard = stamp ? (Array.isArray(stamp.stamp_cards) ? stamp.stamp_cards[0] : stamp.stamp_cards) : null;

  return (
    <main className="mx-auto min-h-dvh max-w-xl px-5 py-6">
      <div className="flex items-center justify-between">
        <Link href="/wallet" className="inline-flex size-10 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800"><ArrowLeft className="size-4"/></Link>
        {canManage && <Link href={`/programs/${slug}/manage`}><Button variant="secondary" className="gap-2"><Settings2 className="size-4"/>Manage</Button></Link>}
      </div>
      <div className="mt-8 grid size-20 place-items-center rounded-[24px] bg-zinc-950 text-3xl font-semibold text-white dark:bg-white dark:text-zinc-950">{program.name.slice(0,1)}</div>
      <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em]">{program.name}</h1>
      <p className="mt-2 leading-7 text-zinc-500">{program.description || "A Keptpoint loyalty program."}</p>

      {member?.status === "active" ? (
        <section className="mt-7 grid grid-cols-2 gap-3">
          {(program.program_type === "points" || program.program_type === "hybrid") && <div className="rounded-[22px] border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"><p className="text-xs text-zinc-500">Available</p><p className="mt-2 text-2xl font-semibold">{Math.max(0, Number(account?.balance ?? 0) - Number(account?.reserved_balance ?? 0))}</p><p className="text-xs text-zinc-500">{program.currency_name}</p></div>}
          {(program.program_type === "stamps" || program.program_type === "hybrid") && <div className="rounded-[22px] border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"><p className="text-xs text-zinc-500">Stamp card</p><p className="mt-2 text-2xl font-semibold">{stamp?.stamp_count ?? 0}/{stampCard?.required_stamps ?? "–"}</p><p className="text-xs text-zinc-500">{stamp?.status ?? "active"}</p></div>}
        </section>
      ) : (
        <form action={joinProgram.bind(null, program.id)} className="mt-7"><Button className="w-full">Join this program</Button></form>
      )}

      <section className="mt-8"><div className="flex items-center gap-2"><Gift className="size-5"/><h2 className="font-semibold">Rewards</h2></div><div className="mt-3 grid gap-3">{rewards.length === 0 && <p className="rounded-2xl border border-dashed border-zinc-300 p-5 text-sm text-zinc-500 dark:border-zinc-700">No rewards yet.</p>}{rewards.map((reward)=>{const action=redeemReward.bind(null,reward.id); const cost=reward.reward_type === "points" ? `${reward.points_required} pts` : reward.reward_type === "stamps" ? `${reward.stamps_required} stamps` : "Manual"; return <form action={action} key={reward.id} className="rounded-[22px] border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"><div className="flex items-start gap-3"><div className="grid size-11 place-items-center rounded-2xl bg-zinc-100 dark:bg-zinc-900"><Gift className="size-5"/></div><div className="min-w-0 flex-1"><p className="font-semibold">{reward.name}</p><p className="mt-1 text-sm text-zinc-500">{reward.description || cost}</p><p className="mt-2 text-xs font-medium">{cost}{reward.stock == null ? "" : ` · ${reward.stock} left`}</p></div></div>{member?.status === "active" && <button className="mt-4 h-10 w-full rounded-xl border border-zinc-200 text-sm font-semibold dark:border-zinc-800">Redeem</button>}</form>})}</div></section>
      <Link href="/scan" className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 p-4 text-sm font-semibold dark:border-zinc-800"><QrCode className="size-4"/>Scan Keptpoint QR</Link>
    </main>
  );
}
