import Link from "next/link";
import { ArrowLeft, QrCode } from "lucide-react";
import { MerchantQrGenerator } from "@/components/merchant-qr-generator";
import { getLocale } from "@/lib/preferences";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Merchant QR" };

export default async function MerchantQrPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const th = locale === "th";
  const supabase = await createClient();
  const { data: program } = await supabase.from("programs").select("id,name,program_type").eq("slug", slug).single();
  if (!program) return <main className="p-6">{th ? "ไม่พบโปรแกรม" : "Program not found."}</main>;

  return <main className="mx-auto min-h-dvh max-w-5xl px-5 py-6 lg:px-8 lg:py-8">
    <Link href={`/programs/${slug}/manage`} className="cute-icon-button" aria-label={th ? "กลับแดชบอร์ดร้าน" : "Back to business dashboard"}><ArrowLeft className="size-4" /></Link>
    <div className="mt-6 flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-[#087F6E]">{program.name}</p><h1 className="mt-1 text-3xl font-semibold tracking-[-0.045em]">{th ? "QR / Scanner" : "QR / Scanner"}</h1><p className="mt-2 text-sm leading-6 text-slate-500">{th ? "สร้าง QR สำหรับสะสมแต้ม เติมสแตมป์ หรือให้ลูกค้าเข้าร่วมโปรแกรม" : "Create short-lived QR codes for points, stamps, or program joining."}</p></div><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#EDF4FF] text-[#3B82F6]"><QrCode className="size-6" /></span></div>
    <div className="mt-6"><MerchantQrGenerator programId={program.id} programType={program.program_type} locale={locale} /></div>
  </main>;
}
