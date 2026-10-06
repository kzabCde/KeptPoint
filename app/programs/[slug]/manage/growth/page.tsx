import Link from "next/link";
import { BadgePercent, Crown, Share2 } from "lucide-react";
import { createCoupon, createTier, redeemCoupon, saveReferralSettings, toggleCoupon, toggleTier } from "@/app/actions/growth";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/preferences";
import { cn } from "@/lib/utils";

type Tab = "referral" | "coupons" | "tiers";

export default async function GrowthManagePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ tab?: string }> }) {
  const [{ slug }, query, locale, supabase] = await Promise.all([params, searchParams, getLocale(), createClient()]);
  const th = locale === "th";
  const tab: Tab = (["referral","coupons","tiers"] as const).includes(query.tab as Tab) ? query.tab as Tab : "referral";
  const { data: program } = await supabase.from("programs").select("id,name").eq("slug", slug).maybeSingle();
  if (!program) return <main className="p-6 text-sm text-zinc-500">{th ? "ไม่พบโปรแกรมนี้" : "Program not found."}</main>;

  const [settingsResult, couponsResult, tiersResult, claimsResult, referralTotal, referralRewarded, couponClaimTotal, couponRedeemed] = await Promise.all([
    supabase.from("program_referral_settings").select("enabled,referrer_bonus,referred_bonus").eq("program_id", program.id).maybeSingle(),
    supabase.from("coupons").select("id,code,name,description,discount_type,discount_value,max_redemptions,max_per_user,expires_at,active").eq("program_id", program.id).order("created_at", { ascending: false }),
    supabase.from("program_tiers").select("id,name,min_lifetime_earned,benefits,active").eq("program_id", program.id).order("min_lifetime_earned"),
    supabase.from("coupon_redemptions").select("id,status,claimed_at,coupons(name,code),profiles!coupon_redemptions_user_id_fkey(username,display_name)").eq("program_id", program.id).eq("status", "claimed").order("claimed_at", { ascending: false }).limit(20),
    supabase.from("referrals").select("id", { count: "exact", head: true }).eq("program_id", program.id),
    supabase.from("referrals").select("id", { count: "exact", head: true }).eq("program_id", program.id).eq("status", "rewarded"),
    supabase.from("coupon_redemptions").select("id", { count: "exact", head: true }).eq("program_id", program.id),
    supabase.from("coupon_redemptions").select("id", { count: "exact", head: true }).eq("program_id", program.id).eq("status", "redeemed"),
  ]);
  const settings = settingsResult.data ?? { enabled: false, referrer_bonus: 50, referred_bonus: 50 };
  const coupons = couponsResult.data ?? [];
  const tiers = tiersResult.data ?? [];
  const claims = claimsResult.data ?? [];

  const tabs: [Tab,string,typeof Share2][] = [
    ["referral", "Referral", Share2],
    ["coupons", th ? "คูปอง" : "Coupons", BadgePercent],
    ["tiers", th ? "ระดับสมาชิก" : "Tiers", Crown],
  ];

  return <main className="p-5 sm:p-7 lg:p-8">
    <div className="mx-auto max-w-5xl">
      <p className="text-xs font-bold uppercase tracking-[.14em] text-emerald-700 dark:text-emerald-300">Growth</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-.045em]">{th ? "เครื่องมือเติบโต" : "Growth tools"}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">{th ? "จัด Referral, Coupon และ Member Tier แยกเป็นงานชัดเจน แต่ยังอยู่ในพื้นที่ Growth เดียวกัน" : "Manage referrals, coupons, and member tiers as focused workflows inside one growth workspace."}</p>
      <nav className="mt-6 flex gap-2 overflow-x-auto pb-2" aria-label="Growth"><>{tabs.map(([key,label,Icon]) => <Link key={key} href={`/programs/${slug}/manage/growth?tab=${key}`} className={cn("inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold", tab === key ? "border-[#0F2D46] bg-[#0F2D46] text-white dark:border-[#10C9A7] dark:bg-[#10C9A7] dark:text-[#0F2D46]" : "border-[var(--border)] bg-[var(--surface)] text-slate-500")}><Icon className="size-4"/>{label}</Link>)}</></nav>

      {tab === "referral" && <section className="mt-5 rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-[#E6FAF6] text-[#087F6E]"><Share2 className="size-5"/></span><div><h2 className="font-semibold">Referral</h2><p className="text-xs text-zinc-500">{th ? "แจกโบนัสหลังสมาชิกใหม่สะสมครั้งแรก" : "Reward both sides after the new member's first qualifying earn."}</p></div></div><div className="flex gap-2"><Stat value={referralTotal.count ?? 0} label={th ? "ชวนแล้ว" : "Invited"}/><Stat value={referralRewarded.count ?? 0} label={th ? "สำเร็จ" : "Converted"}/></div></div>
        <form action={saveReferralSettings} className="mt-6 grid gap-4 sm:grid-cols-3"><input type="hidden" name="programId" value={program.id}/><input type="hidden" name="slug" value={slug}/><label className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-3 text-sm font-medium"><input type="checkbox" name="enabled" defaultChecked={settings.enabled}/>{th ? "เปิด Referral" : "Enable referrals"}</label><label className="text-xs font-semibold text-zinc-500">{th ? "โบนัสผู้ชวน" : "Referrer bonus"}<input className="mt-1 h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm" name="referrerBonus" type="number" min="0" defaultValue={settings.referrer_bonus}/></label><label className="text-xs font-semibold text-zinc-500">{th ? "โบนัสสมาชิกใหม่" : "New-member bonus"}<input className="mt-1 h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm" name="referredBonus" type="number" min="0" defaultValue={settings.referred_bonus}/></label><PendingSubmitButton pendingLabel={th ? "กำลังบันทึก…" : "Saving…"} className="cute-primary h-11 rounded-xl px-4 text-sm font-bold sm:col-span-3">{th ? "บันทึก Referral" : "Save referral settings"}</PendingSubmitButton></form>
      </section>}

      {tab === "coupons" && <section className="mt-5 rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-[#FFF4D6] text-[#B7791F]"><BadgePercent className="size-5"/></span><div><h2 className="font-semibold">Coupons</h2><p className="text-xs text-zinc-500">{th ? "สร้างข้อเสนอ จำกัดสิทธิ์ และติดตามการใช้" : "Create offers, set limits, and track usage."}</p></div></div><div className="flex gap-2"><Stat value={couponClaimTotal.count ?? 0} label={th ? "เก็บแล้ว" : "Claimed"}/><Stat value={couponRedeemed.count ?? 0} label={th ? "ใช้แล้ว" : "Redeemed"}/></div></div>
        <form action={createCoupon} className="mt-6 grid gap-3 md:grid-cols-2"><input type="hidden" name="programId" value={program.id}/><input type="hidden" name="slug" value={slug}/><input required name="name" maxLength={100} placeholder={th ? "ชื่อคูปอง" : "Coupon name"} className="h-11 rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm"/><input required name="code" maxLength={32} placeholder="WELCOME10" className="h-11 rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm uppercase"/><select name="discountType" className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"><option value="perk">Perk / benefit</option><option value="percent">Percent</option><option value="fixed">Fixed value</option></select><input name="discountValue" type="number" min="0" step="0.01" placeholder={th ? "มูลค่า (เว้นว่างสำหรับ Perk)" : "Value (blank for perk)"} className="h-11 rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm"/><input name="maxRedemptions" type="number" min="1" placeholder={th ? "จำนวนสิทธิ์รวม" : "Total allocation"} className="h-11 rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm"/><input name="maxPerUser" type="number" min="1" defaultValue="1" className="h-11 rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm"/><input name="expiresAt" type="datetime-local" className="h-11 rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm"/><input name="description" maxLength={500} placeholder={th ? "รายละเอียดสั้น ๆ" : "Short description"} className="h-11 rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm"/><PendingSubmitButton pendingLabel={th ? "กำลังสร้าง…" : "Creating…"} className="cute-primary h-11 rounded-xl px-4 text-sm font-bold md:col-span-2">{th ? "สร้างคูปอง" : "Create coupon"}</PendingSubmitButton></form>
        <div className="mt-6 grid gap-2">{coupons.length === 0 && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-white/5">{th ? "ยังไม่มีคูปอง สร้างคูปองแรกเพื่อเริ่มแคมเปญ" : "No coupons yet. Create your first campaign offer."}</p>}{coupons.map((coupon) => <div key={coupon.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-white/5"><div className="min-w-0 flex-1"><p className="font-semibold">{coupon.name} <span className="font-mono text-xs text-zinc-400">{coupon.code}</span></p><p className="text-xs text-zinc-500">{coupon.discount_type}{coupon.discount_value == null ? "" : ` · ${coupon.discount_value}`} · {coupon.active ? (th ? "เปิดใช้" : "Active") : (th ? "พัก" : "Paused")}</p></div><form action={toggleCoupon.bind(null,coupon.id,slug,!coupon.active)}><button className="cute-secondary rounded-xl px-3 py-2 text-xs font-bold">{coupon.active ? (th ? "พักใช้งาน" : "Pause") : (th ? "เปิดใช้งาน" : "Activate")}</button></form></div>)}</div>
        <div className="mt-7 border-t border-[var(--border)] pt-6"><h3 className="font-semibold">{th ? "คูปองที่รอยืนยัน" : "Coupon claims awaiting confirmation"}</h3><div className="mt-3 grid gap-2">{claims.length===0 && <p className="text-sm text-zinc-500">{th ? "ยังไม่มีรายการ" : "No pending claims."}</p>}{claims.map((claim) => { const coupon = Array.isArray(claim.coupons) ? claim.coupons[0] : claim.coupons; const profile = Array.isArray(claim.profiles) ? claim.profiles[0] : claim.profiles; return <div key={claim.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-white/5"><div className="flex-1"><p className="text-sm font-semibold">{coupon?.name ?? "Coupon"} · {coupon?.code}</p><p className="text-xs text-zinc-500">@{profile?.username ?? profile?.display_name ?? "member"}</p></div><form action={redeemCoupon.bind(null,claim.id,slug)}><PendingSubmitButton pendingLabel={th ? "กำลังยืนยัน…" : "Confirming…"} className="cute-primary rounded-xl px-3 py-2 text-xs font-bold">{th ? "ยืนยันใช้คูปอง" : "Confirm redemption"}</PendingSubmitButton></form></div>;})}</div></div>
      </section>}

      {tab === "tiers" && <section className="mt-5 rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-[#EAF2FF] text-blue-600"><Crown className="size-5"/></span><div><h2 className="font-semibold">Member tiers</h2><p className="text-xs text-zinc-500">{th ? "เรียงระดับจาก Lifetime points ที่สะสมจริง" : "Order tiers by real lifetime points earned."}</p></div></div>
        <form action={createTier} className="mt-6 grid gap-3 md:grid-cols-3"><input type="hidden" name="programId" value={program.id}/><input type="hidden" name="slug" value={slug}/><input required name="name" placeholder="Gold" className="h-11 rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm"/><input required name="minLifetimeEarned" type="number" min="0" placeholder="2000" className="h-11 rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm"/><input name="benefits" placeholder={th ? "สิทธิพิเศษ (คั่นด้วยบรรทัด)" : "Benefits (one per line)"} className="h-11 rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm"/><PendingSubmitButton pendingLabel={th ? "กำลังเพิ่ม…" : "Adding…"} className="cute-primary h-11 rounded-xl px-4 text-sm font-bold md:col-span-3">{th ? "เพิ่มระดับ" : "Add tier"}</PendingSubmitButton></form>
        <div className="mt-6 grid gap-2">{tiers.length===0 && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-white/5">{th ? "ยังไม่มีระดับสมาชิก เพิ่มระดับแรกเพื่อเริ่ม progression" : "No tiers yet. Add the first threshold to start progression."}</p>}{tiers.map((tier,index) => <div key={tier.id} className="flex items-center gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-white/5"><span className="grid size-8 place-items-center rounded-lg bg-[#EAF2FF] text-xs font-bold text-blue-600">{index+1}</span><div className="flex-1"><p className="font-semibold">{tier.name}</p><p className="text-xs text-zinc-500">{Number(tier.min_lifetime_earned).toLocaleString()} lifetime pts</p></div><form action={toggleTier.bind(null,tier.id,slug,!tier.active)}><button className="cute-secondary rounded-xl px-3 py-2 text-xs font-bold">{tier.active ? (th ? "พัก" : "Pause") : (th ? "เปิด" : "Activate")}</button></form></div>)}</div>
      </section>}
    </div>
  </main>;
}

function Stat({ value, label }: { value: number; label: string }) {
  return <div className="min-w-20 rounded-xl bg-slate-50 px-3 py-2 text-center dark:bg-white/5"><p className="text-lg font-semibold">{value}</p><p className="text-[10px] text-slate-400">{label}</p></div>;
}
