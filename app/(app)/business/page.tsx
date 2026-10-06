import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Building2, Plus, Sparkles } from "lucide-react";
import { getLocale } from "@/lib/preferences";
import { productMessages } from "@/lib/product-i18n";
import { createClient } from "@/lib/supabase/server";
import { mergeBusinessWorkspaces } from "@/lib/workspaces";

export const metadata = { title: "Business · PumpPoint" };

export default async function BusinessPage() {
  const [locale, supabase] = await Promise.all([getLocale(), createClient()]);
  const t = productMessages[locale];
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const [{ data: ownedPrograms }, { data: staffRows }] = await Promise.all([
    supabase.from("programs").select("id,name,slug").eq("owner_id", auth.user.id).eq("status", "active"),
    supabase.from("program_staff").select("role,programs(id,name,slug)").eq("user_id", auth.user.id),
  ]);
  const businesses = mergeBusinessWorkspaces(ownedPrograms ?? [], staffRows ?? []);

  return (
    <main className="page-wrap min-w-0">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-[#087F6E]"><Building2 className="size-4" />{t.workspace.business}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-.045em]">{t.business.title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">{t.business.description}</p>
        </div>
        <Link href="/programs/new" className="cute-primary inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold"><Plus className="size-4" />{t.workspace.createProgram}</Link>
      </div>

      {businesses.length === 0 ? (
        <section className="mt-8 overflow-hidden rounded-[28px] border border-[var(--border)] bg-[linear-gradient(135deg,#0F2D46,#123E5F)] p-7 text-white sm:p-9">
          <span className="grid size-12 place-items-center rounded-2xl bg-white/10 text-[#72E5D0]"><Sparkles className="size-6" /></span>
          <h2 className="mt-6 max-w-xl text-2xl font-semibold tracking-[-.04em]">{t.business.emptyTitle}</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">{t.business.emptyCopy}</p>
          <Link href="/programs/new" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#10C9A7] px-4 text-sm font-bold text-[#0F2D46]"><Plus className="size-4" />{t.workspace.createProgram}</Link>
        </section>
      ) : (
        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {businesses.map((business) => (
            <Link key={business.id} href={`/programs/${business.slug}/manage`} className="group rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#10C9A7]/50 hover:shadow-[0_16px_36px_rgba(15,45,70,.08)]">
              <div className="flex items-start gap-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#0F2D46] text-lg font-bold text-white">{business.name.slice(0, 1).toUpperCase()}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-lg font-semibold tracking-[-.025em]">{business.name}</p><p className="mt-1 text-xs font-medium capitalize text-slate-400">{business.role}</p></div>
                <ArrowRight className="size-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#087F6E]" />
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-4 text-xs"><span className="font-semibold text-slate-500">{t.business.openDashboard}</span><span className="font-mono text-slate-400">/{business.slug}</span></div>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
