import Link from "next/link";
import { Compass, Search, Sparkles, Stamp, WalletCards } from "lucide-react";
import { getLocale } from "@/lib/preferences";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Explore stores" };

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const locale = await getLocale();
  const th = locale === "th";
  const { q = "" } = await searchParams;
  const supabase = await createClient();
  const normalized = q.trim();
  let query = supabase.from("programs").select("id,name,slug,description,program_type,currency_name,color").eq("visibility", "public").eq("status", "active").order("created_at", { ascending: false }).limit(60);
  if (normalized) query = query.ilike("name", `%${normalized.replaceAll("%", "")}%`);
  const { data: programs } = await query;

  return <main className="page-wrap min-w-0">
    <div className="flex items-start justify-between gap-5"><div><p className="text-sm font-semibold text-[#087F6E]"><Sparkles className="mr-1.5 inline size-4" />{th ? "เจอร้านใหม่ ๆ" : "Find your next favorite"}</p><h1 className="mt-1 text-3xl font-semibold tracking-[-0.045em]">{th ? "ค้นหาร้าน" : "Explore stores"}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{th ? "ค้นหาโปรแกรมสะสมแต้มและบัตรสแตมป์ที่เปิดให้เข้าร่วม" : "Discover public point programs and stamp cards you can join."}</p></div><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#EDF4FF] text-[#3B82F6]"><Compass className="size-6" /></span></div>
    <form className="mt-6 max-w-xl"><label className="cute-input flex h-12 items-center gap-3 px-4"><Search className="size-4 text-slate-400" /><input name="q" defaultValue={q} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder={th ? "ค้นหาชื่อร้าน" : "Search stores"} /><button className="text-sm font-bold text-[#087F6E]">{th ? "ค้นหา" : "Search"}</button></label></form>

    {(programs ?? []).length === 0 ? <section className="cute-card mt-6 p-8 text-center shadow-none"><Compass className="mx-auto size-9 text-slate-300" /><h2 className="mt-4 font-semibold">{th ? "ยังไม่พบร้าน" : "No stores found"}</h2><p className="mt-2 text-sm text-slate-500">{th ? "ลองใช้คำค้นหาอื่น หรือกลับมาใหม่เมื่อมีร้านเพิ่ม" : "Try a different search or check back as new partners join."}</p></section> :
    <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{(programs ?? []).map((program) => {
      const Icon = program.program_type === "points" ? WalletCards : Stamp;
      return <Link key={program.id} href={`/programs/${program.slug}`} className="cute-card group min-w-0 p-5 shadow-none transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-[0_8px_24px_rgba(15,45,70,.08)]"><div className="flex items-start gap-3"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#0F2D46] text-white"><Icon className="size-5" /></span><div className="min-w-0"><h2 className="truncate text-lg font-semibold">{program.name}</h2><p className="mt-1 text-xs font-semibold uppercase tracking-[.08em] text-[#087F6E]">{program.program_type === "points" ? program.currency_name : program.program_type === "stamps" ? (th ? "บัตรสแตมป์" : "Stamp card") : (th ? "แต้ม + สแตมป์" : "Points + stamps")}</p></div></div><p className="mt-4 line-clamp-2 min-h-12 text-sm leading-6 text-slate-500">{program.description || (th ? "ดูรางวัลและเงื่อนไขของโปรแกรมนี้" : "View this program's rewards and earning rules.")}</p><span className="mt-4 inline-flex text-sm font-bold text-[#087F6E]">{th ? "ดูร้านและรางวัล →" : "View store & rewards →"}</span></Link>;
    })}</section>}
  </main>;
}
