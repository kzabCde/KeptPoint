import { QrScanner } from "@/components/qr-scanner";
import { getLocale } from "@/lib/preferences";
import { messages } from "@/lib/i18n";

export const metadata={title:"Scan"};

const qrErrors: Record<string,{th:string;en:string}> = {
  invalid: { th:"QR นี้ไม่ถูกต้องหรือไม่ใช่ PumpPoint QR กรุณาให้ร้านสร้างใหม่", en:"This QR is invalid or is not a PumpPoint QR. Ask the business to generate a new one." },
  expired: { th:"QR หมดอายุแล้ว กรุณาให้ร้านสร้าง QR ใหม่", en:"This QR has expired. Ask the business to generate a new one." },
  used: { th:"QR นี้ถูกใช้ไปแล้วและไม่สามารถใช้ซ้ำได้", en:"This QR has already been used and cannot be reused." },
  own: { th:"บัญชีที่สร้าง QR ไม่สามารถรับ QR ของตัวเองได้", en:"The account that created this QR cannot accept its own QR." },
  membership: { th:"ต้องเป็นสมาชิกที่ใช้งานอยู่ของร้านก่อนจึงจะรับแต้ม/สแตมป์ได้", en:"You must be an active member of this program before receiving points or stamps." },
};

export default async function ScanPage({searchParams}:{searchParams:Promise<{token?:string;qr?:string}>}){
  const {token="",qr}=await searchParams;
  const locale=await getLocale();
  const m=messages[locale].scan;
  const errorMessage=qr?qrErrors[qr]?.[locale]:undefined;
  return <main className="page-wrap min-w-0"><h1 className="text-3xl font-semibold tracking-[-0.04em]">{m.title}</h1><p className="mt-2 text-sm leading-6 text-zinc-500">{m.description}</p>{errorMessage&&<p role="alert" className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700 dark:bg-rose-950/30 dark:text-rose-200">{errorMessage}</p>}<QrScanner initialToken={token} locale={locale}/><p className="mt-5 rounded-2xl bg-emerald-50 p-4 text-xs leading-5 text-emerald-950/70 dark:bg-emerald-950/30 dark:text-emerald-100/70">{m.security}</p></main>;
}
