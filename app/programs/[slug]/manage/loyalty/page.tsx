import { Settings2, Stamp, WalletCards } from "lucide-react";
import { saveLoyaltySettings } from "@/app/actions/program-settings";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { getLocale } from "@/lib/preferences";
import { createClient } from "@/lib/supabase/server";

export default async function LoyaltySettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, locale, supabase] = await Promise.all([params, getLocale(), createClient()]);
  const th = locale === "th";
  const { data: program } = await supabase.from("programs").select("id,name,program_type,currency_name,allow_point_transfer").eq("slug", slug).maybeSingle();
  if (!program) return <main className="p-6 text-sm text-slate-500">{th ? "ไม่พบโปรแกรม" : "Program not found."}</main>;
  const { data: stampCard } = await supabase.from("stamp_cards").select("id,name,required_stamps,max_stamps_per_transaction,reset_behavior,expires_in_days,active").eq("program_id", program.id).eq("active", true).order("created_at").limit(1).maybeSingle();

  return <main className="p-5 sm:p-7 lg:p-8"><div className="mx-auto max-w-4xl">
    <div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-[#087F6E]"><Settings2 className="size-4"/>Loyalty</p><h1 className="mt-2 text-3xl font-semibold tracking-[-.045em]">{th ? "แต้มและสแตมป์" : "Points & stamps"}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">{th ? "ตั้งค่าพื้นฐานของ Loyalty โดยไม่กระทบยอดสะสมเดิมของสมาชิก" : "Tune the core loyalty rules without changing members' existing balances."}</p></div>

    <form action={saveLoyaltySettings} className="mt-7 grid gap-5">
      <input type="hidden" name="programId" value={program.id}/><input type="hidden" name="slug" value={slug}/>
      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-[#E6FAF6] text-[#087F6E]"><WalletCards className="size-5"/></span><div><h2 className="font-semibold">{th ? "แต้ม" : "Points"}</h2><p className="text-xs text-slate-500">{program.program_type}</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold text-slate-500">{th ? "ชื่อหน่วยแต้ม" : "Point currency name"}<input required name="currencyName" defaultValue={program.currency_name} maxLength={30} className="mt-1 h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm"/></label><label className="flex min-h-11 items-center gap-3 self-end rounded-xl border border-[var(--border)] px-3 text-sm font-semibold"><input type="checkbox" name="allowPointTransfer" defaultChecked={program.allow_point_transfer}/>{th ? "อนุญาตให้สมาชิกโอนแต้ม" : "Allow member point transfers"}</label></div></section>

      {(program.program_type === "stamps" || program.program_type === "hybrid") && <section className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-[#FFF4D6] text-[#B7791F]"><Stamp className="size-5"/></span><div><h2 className="font-semibold">{th ? "บัตรสแตมป์" : "Stamp card"}</h2><p className="text-xs text-slate-500">{stampCard?.name ?? (th ? "ยังไม่มีบัตรสแตมป์ที่เปิดใช้" : "No active stamp card")}</p></div></div>{stampCard && <><input type="hidden" name="stampCardId" value={stampCard.id}/><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold text-slate-500">{th ? "จำนวนสแตมป์ที่ต้องใช้" : "Required stamps"}<input required name="requiredStamps" type="number" min="1" max="100" defaultValue={stampCard.required_stamps} className="mt-1 h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm"/></label><label className="text-xs font-semibold text-slate-500">{th ? "สแตมป์สูงสุดต่อรายการ" : "Max stamps per transaction"}<input required name="maxStampsPerTransaction" type="number" min="1" max="100" defaultValue={stampCard.max_stamps_per_transaction} className="mt-1 h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm"/></label></div><p className="mt-4 text-xs text-slate-400">{th ? `การรีเซ็ต: ${stampCard.reset_behavior}${stampCard.expires_in_days ? ` · หมดอายุใน ${stampCard.expires_in_days} วัน` : ""}` : `Reset: ${stampCard.reset_behavior}${stampCard.expires_in_days ? ` · expires in ${stampCard.expires_in_days} days` : ""}`}</p></>}</section>}

      <PendingSubmitButton pendingLabel={th ? "กำลังบันทึก…" : "Saving…"} className="cute-primary min-h-12 rounded-xl px-5 text-sm font-bold">{th ? "บันทึกการตั้งค่า Loyalty" : "Save loyalty settings"}</PendingSubmitButton>
    </form>
  </div></main>;
}
