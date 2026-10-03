import Link from "next/link";
import { ChevronRight, CircleUserRound, QrCode, Settings, Store } from "lucide-react";

export const metadata = { title: "Profile" };

export default function ProfilePage() {
  return <main className="px-5 py-6"><div className="flex items-center gap-4"><div className="grid size-16 place-items-center rounded-full bg-zinc-200 dark:bg-zinc-800"><CircleUserRound className="size-8"/></div><div><h1 className="text-xl font-semibold">Keptpoint User</h1><p className="text-sm text-zinc-500">@keptuser</p></div></div><div className="mt-7 divide-y divide-zinc-200 rounded-[24px] border border-zinc-200 bg-white px-4 dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">{[[QrCode,"My Keptpoint QR","/scan"],[Store,"My programs","/programs/new"],[Settings,"Settings","#"]].map(([Icon,label,href])=>{const C=Icon as typeof QrCode;return <Link key={String(label)} href={String(href)} className="flex items-center gap-3 py-4"><C className="size-5"/><span className="flex-1 font-medium">{String(label)}</span><ChevronRight className="size-4 text-zinc-400"/></Link>})}</div></main>;
}
