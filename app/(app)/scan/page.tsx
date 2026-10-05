import { QrScanner } from "@/components/qr-scanner";
import { getLocale } from "@/lib/preferences";
import { messages } from "@/lib/i18n";

export const metadata={title:"Scan"};

export default async function ScanPage({searchParams}:{searchParams:Promise<{token?:string}>}){
  const {token=""}=await searchParams;
  const locale=await getLocale();
  const m=messages[locale].scan;
  return <main className="page-wrap min-w-0"><h1 className="text-3xl font-semibold tracking-[-0.04em]">{m.title}</h1><p className="mt-2 text-sm leading-6 text-zinc-500">{m.description}</p><QrScanner initialToken={token} locale={locale}/><p className="mt-5 rounded-2xl bg-emerald-50 p-4 text-xs leading-5 text-emerald-950/70 dark:bg-emerald-950/30 dark:text-emerald-100/70">{m.security}</p></main>;
}
