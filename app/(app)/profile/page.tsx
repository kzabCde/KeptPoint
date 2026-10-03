import Image from "next/image";
import Link from "next/link";
import { ChevronRight, QrCode, Settings, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/preferences";
import { messages } from "@/lib/i18n";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const locale = await getLocale();
  const m = messages[locale].profile;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const { data: profile } = auth.user
    ? await supabase.from("profiles").select("display_name,username").eq("id", auth.user.id).maybeSingle()
    : { data: null };
  const displayName = profile?.display_name || auth.user?.email?.split("@")[0] || m.fallbackName;
  const username = profile?.username ? `@${profile.username}` : auth.user?.email ?? "@keptpoint";

  const links = [
    [QrCode, m.myQr, "/scan"],
    [Store, m.myPrograms, "/programs/new"],
    [Settings, m.settings, "/settings"],
  ] as const;

  return (
    <main className="px-5 py-6">
      <div className="flex items-center gap-4">
        <div className="grid size-16 place-items-center overflow-hidden rounded-[20px] bg-[#063c35] shadow-sm"><Image src="/keptpoint-mark.svg" alt="" width={64} height={64}/></div>
        <div className="min-w-0"><h1 className="truncate text-xl font-semibold">{displayName}</h1><p className="truncate text-sm text-zinc-500">{username}</p></div>
      </div>
      <div className="mt-7 divide-y divide-zinc-200 rounded-[24px] border border-zinc-200 bg-white px-4 dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
        {links.map(([Icon,label,href])=><Link key={label} href={href} className="flex items-center gap-3 py-4 transition hover:text-emerald-700 dark:hover:text-emerald-300"><span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"><Icon className="size-4"/></span><span className="flex-1 font-medium">{label}</span><ChevronRight className="size-4 text-zinc-400"/></Link>)}
      </div>
    </main>
  );
}
