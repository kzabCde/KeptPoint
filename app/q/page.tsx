import Link from "next/link";
import { QrCode, ScanLine } from "lucide-react";
import { redirect } from "next/navigation";
import { Brand } from "@/components/brand";
import { getLocale } from "@/lib/preferences";
import { normalizeQrToken } from "@/lib/share-links";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Open PumpPoint QR", robots: { index: false, follow: false } };

export default async function QrEntryPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const [{ token: rawToken = "" }, locale, supabase] = await Promise.all([searchParams, getLocale(), createClient()]);
  const th = locale === "th";
  const token = normalizeQrToken(rawToken);

  if (!token) {
    return (
      <main className="auth-canvas min-h-dvh px-5 py-8">
        <div className="mx-auto w-full max-w-md">
          <Brand/>
          <section className="cute-card mt-7 p-6 sm:p-7">
            <span className="grid size-14 place-items-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/30"><QrCode className="size-6"/></span>
            <h1 className="mt-5 text-3xl font-semibold tracking-[-.045em]">{th ? "QR ไม่ถูกต้อง" : "Invalid QR"}</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-500">{th ? "QR นี้ไม่ใช่ PumpPoint QR ที่สมบูรณ์ กรุณาให้ร้านสร้าง QR ใหม่แล้วสแกนอีกครั้ง" : "This is not a valid PumpPoint QR. Ask the business to generate a new code and scan again."}</p>
            <Link href="/scan" className="cute-secondary mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold"><ScanLine className="size-4"/>{th ? "เปิดเครื่องสแกน PumpPoint" : "Open PumpPoint scanner"}</Link>
          </section>
        </div>
      </main>
    );
  }

  const destination = `/scan?token=${encodeURIComponent(token)}`;
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect(`/login?next=${encodeURIComponent(destination)}`);
  redirect(destination);
}
