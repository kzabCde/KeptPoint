import { BadgePercent, Crown, Share2 } from "lucide-react";
import { createCoupon, createTier, redeemCoupon, saveReferralSettings, toggleCoupon, toggleTier } from "@/app/actions/growth";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/preferences";

export default async function GrowthManagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const th = (await getLocale()) === "th";
  const supabase = await createClient();
  const { data: program } = await supabase.from("programs").select("id,name").eq("slug", slug).single();
  const [settingsResult, couponsResult, tiersResult, claimsResult] = await Promise.all([
    supabase.from("program_referral_settings").select("enabled,referrer_bonus,referred_bonus").eq("program_id", program.id).maybeSingle(),
    supabase.from("coupons").select("id,code,name,description,discount_type,discount_value,max_redemptions,max_per_user,expires_at,active").eq("program_id", program.id).order("created_at", { ascending: false }),
    supabase.from("program_tiers").select("id,name,min_lifetime_earned,benefits,active").eq("program_id", program.id).order("min_lifetime_earned"),
    supabase.from("coupon_redemptions").select("id,status,claimed_at,coupons(name,code),profiles:user_id(username,display_name)").eq("program_id", program.id).eq("status", "claimed").order("claimed_at", { ascending: false }).limit(20),
  ]);
  const settings = settingsResult.data ?? { enabled: false, referrer_bonus: 50, referred_bonus: 50 };
  const coupons = couponsResult.data ?? [];
  const tiers = tiersResult.data ?? [];
  const claims = claimsResult.data ?? [];

  return <main className="p-5 sm:p-8 lg:p-10">
    <div className="max-w-5xl">
      <p className="text-xs font-bold uppercase tracking-[.14em] text-emerald-700 dark:text-emerald-300">Growth loyalty</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-.045em]">{th ? "Referral, Coupon และ Member Tier" : "Referral, coupons, and member tiers"}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">{th ? "ตั้งเครื่องมือที่ช่วยให้สมาชิกชวนเพื่อน กลับมาใช้สิทธิ์ และเห็นเป้าหมายระดับสมาชิกได้จากหน้าเดียว" : "Configure the tools that help members invite friends, redeem offers, and progress through loyalty tiers."}</p>

      <section className="mt-8 rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-[#E6FAF6] text-[#087F6E]"><Share2 className="size-5"/></span><div><h2 className="font-semibold">Referral</h2><p className="text-xs text-zinc-500">{th ? "แจกโบนัสเมื่อสมาชิกใหม่สะสมแต้มครั้งแรก" : "Reward both sides after the new member's first qualifying earn."}</p></div></div>
        <form action={saveReferralSettings} className="mt-5 grid gap-4 sm:grid-cols-3">
          <input type="hidden" name="programId" value={program.id}/><input type="hidden" name="slug" value={slug}/>
          <label className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-3 text-sm font-medium"><input type="checkbox" name="enabled" defaultChecked={settings.enabled}/>{th ? "เปิด Referral" : "Enable referrals"}</label>
          <label className="text-xs font-semibold text-zinc-500">{th ? "โบนัสผู้ชวน" : "Referrer bonus"}<input className="mt-1 h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm" name="referrerBonus" type="number" min="0" defaultValue={settings.referrer_bonus}/></label>
          <label className="text-xs font-semibold text-zinc-500">{th ? "โบนัสสมาชิกใหม่" : "New-member bonus"}<input className="mt-1 h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm" name="referredBonus" type="number" min="0" defaultValue={settings.referred_bonus}/></label>
          <PendingSubmitButton pendingLabel={th ? "กำลังบันทึก…" : "Saving…"} className="cute-primary h-11 rounded-xl px-4 text-sm font-bold sm:col-span-3">{th ? "บันทึก Referral" : "Save referral settings"}</PendingSubmitButton>
        </form>
      </section>

      <section className="mt-6 rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-[#FFF4D6] text-[#B7791F]"><BadgePercent className="size-5"/></span><div><h2 className="font-semibold">Coupons</h2><p className="text-xs text-zinc-500">{th ? "สร้างข้อเสนอและจำกัดสิทธิ์ต่อคน" : "Create offers with expiry and per-member limits."}</p></div></div>
        <form action={createCoupon} className="mt-5 grid gap-3 md:grid-cols-2">
          <input type="hidden" name="programId" value={program.id}/><input type="hidden" name="slug" value={slug}/>
          <input required name="name" maxLength={100} placeholder={th ? "ชื่อคูปอง" : "Coupon name"} className="h-11 rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm"/>
          <input required name="code" maxLength={32} placeholder="WELCOME10" className="h-11 rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm uppercase"/>
          <select name="discountType" className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"><option value="perk">Perk / benefit</option><option value="percent">Percent</option><option value="fixed">Fixed value</option></select>
          <input name="discountValue" type="number" min="0" step="0.01" placeholder={th ? "มูลค่า (เว้นว่างสำหรับ Perk)" : "Value (blank for perk)"} className="h-11 rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm"/>
          <input name="maxRedemptions" type="number" min="1" placeholder={th ? "จำนวนสิทธิ์รวม (ไม่จำกัดถ้าว่าง)" : "Total allocation (blank = unlimited)"} className="h-11 rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm"/>
          <input name="maxPerUser" type="number" min="1" defaultValue="1" className="h-11 rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm"/>
          <input name="expiresAt" type="datetime-local" className="h-11 rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm"/>
          <input name="description" maxLength={500} placeholder={th ? "รายละเอียดสั้น ๆ" : "Short description"} className="h-11 rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm"/>
          <PendingSubmitButton pendingLabel={th ? "กำลังสร้าง…" : "Creating…"} className="cute-primary h-11 rounded-xl px-4 text-sm font-bold md:col-span-2">{th ? "สร้างคูปอง" : "Create coupon"}</PendingSubmitButton>
        </form>
        <div className="mt-5 grid gap-2">{coupons.map((coupon) => <div key={coupon.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-white/5"><div className="min-w-0 flex-1"><p className="font-semibold">{coupon.name} <span className="font-mono text-xs text-zinc-400">{coupon.code}</span></p><p className="text-xs text-zinc-500">{coupon.discount_type}{coupon.discount_value == null ? "" : ` · ${coupon.discount_value}`}</p></div><form action={toggleCoupon.bind(null,coupon.id,slug,!coupon.active)}><button className="cute-secondary rounded-xl px-3 py-2 text-xs font-bold">{coupon.active ? (th ? "พักใช้งาน" : "Pause") : (th ? "เปิดใช้งาน" : "Activate")}</button></form></div>)}</div>
      </section>

      <section className="mt-6 rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-[#EAF2FF] text-blue-600"><Crown className="size-5"/></span><div><h2 className="font-semibold">Member tiers</h2><p className="text-xs text-zinc-500">{th ? "ระดับคำนวณจาก Lifetime points ที่สะสมจริง" : "Tiers are derived from real lifetime points earned."}</p></div></div>
        <form action={createTier} className="mt-5 grid gap-3 md:grid-cols-3"><input type="hidden" name="programId" value={program.id}/><input type="hidden" name="slug" value={slug}/><input required name="name" placeholder="Gold" className="h-11 rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm"/><input required name="minLifetimeEarned" type="number" min="0" placeholder="2000" className="h-11 rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm"/><input name="benefits" placeholder={th ? "สิทธิพิเศษ (1 บรรทัดต่อ 1 รายการ)" : "Benefits (one per line)"} className="h-11 rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm"/><PendingSubmitButton pendingLabel={th ? "กำลังเพิ่ม…" : "Adding…"} className="cute-primary h-11 rounded-xl px-4 text-sm font-bold md:col-span-3">{th ? "เพิ่มระดับ" : "Add tier"}</PendingSubmitButton></form>
        <div className="mt-5 grid gap-2">{tiers.map((tier) => <div key={tier.id} className="flex items-center gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-white/5"><div className="flex-1"><p className="font-semibold">{tier.name}</p><p className="text-xs text-zinc-500">{Number(tier.min_lifetime_earned).toLocaleString()} lifetime pts</p></div><form action={toggleTier.bind(null,tier.id,slug,!tier.active)}><button className="cute-secondary rounded-xl px-3 py-2 text-xs font-bold">{tier.active ? (th ? "พัก" : "Pause") : (th ? "เปิด" : "Activate")}</button></form></div>)}</div>
      </section>

      <section className="mt-6 rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"><h2 className="font-semibold">{th ? "คูปองที่รอยืนยัน" : "Coupon claims awaiting confirmation"}</h2><div className="mt-4 grid gap-2">{claims.length===0 && <p className="text-sm text-zinc-500">{th ? "ยังไม่มีรายการ" : "No pending claims."}</p>}{claims.map((claim) => { const coupon = Array.isArray(claim.coupons) ? claim.coupons[0] : claim.coupons; const profile = Array.isArray(claim.profiles) ? claim.profiles[0] : claim.profiles; return <div key={claim.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-white/5"><div className="flex-1"><p className="text-sm font-semibold">{coupon?.name ?? "Coupon"} · {coupon?.code}</p><p className="text-xs text-zinc-500">@{profile?.username ?? profile?.display_name ?? "member"}</p></div><form action={redeemCoupon.bind(null,claim.id,slug)}><PendingSubmitButton pendingLabel={th ? "กำลังยืนยัน…" : "Confirming…"} className="cute-primary rounded-xl px-3 py-2 text-xs font-bold">{th ? "ยืนยันใช้คูปอง" : "Confirm redemption"}</PendingSubmitButton></form></div>;})}</div></section>
    </div>
  </main>;
}
