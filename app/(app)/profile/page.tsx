import Image from "next/image";
import Link from "next/link";
import { ChevronRight, LogOut, QrCode, Settings, Store } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/preferences";
import { messages } from "@/lib/i18n";

export const metadata={title:"Profile"};

export default async function ProfilePage(){
  const locale=await getLocale();
  const m=messages[locale].profile;
  const supabase=await createClient();
  const {data:auth}=await supabase.auth.getUser();
  const {data:profile}=await supabase.from("profiles").select("display_name,username,avatar_url").eq("id",auth.user!.id).maybeSingle();
  const displayName=profile?.display_name||auth.user?.email?.split("@")[0]||m.fallbackName;
  const username=profile?.username?"@"+profile.username:auth.user?.email??"@keptpoint";
  const links=[[QrCode,m.myQr,"/scan"],[Store,m.myPrograms,"/programs/new"],[Settings,m.settings,"/settings"]] as const;
  return <main className="min-w-0 px-5 py-6">
    <div className="flex min-w-0 items-center gap-4">
      <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-[20px] bg-[#063c35] shadow-sm">{profile?.avatar_url?<Image src={profile.avatar_url} alt="" width={64} height={64} className="size-16 object-cover" unoptimized/>:<Image src="/keptpoint-mark.webp" alt="" width={64} height={64}/>}</div>
      <div className="min-w-0"><h1 className="truncate text-xl font-semibold">{displayName}</h1><p className="truncate text-sm text-zinc-500">{username}</p></div>
    </div>
    <div className="mt-7 divide-y divide-zinc-200 rounded-[24px] border border-zinc-200 bg-white px-4 dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">{links.map(([Icon,label,href])=><Link key={label} href={href} className="flex min-w-0 items-center gap-3 py-4 transition hover:text-emerald-700 dark:hover:text-emerald-300"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"><Icon className="size-4"/></span><span className="min-w-0 flex-1 truncate font-medium">{label}</span><ChevronRight className="size-4 shrink-0 text-zinc-400"/></Link>)}</div>
    <form action={signOut} className="mt-5"><button className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 font-semibold text-red-700 dark:border-red-950 dark:bg-red-950/20 dark:text-red-300"><LogOut className="size-4"/>{locale==="th"?"ออกจากระบบ":"Sign out"}</button></form>
  </main>;
}
