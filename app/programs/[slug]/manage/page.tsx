import Link from "next/link";
import { ArrowLeft, Gift, History, UsersRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function ManageProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("programs").select("id,name,program_type").eq("slug", slug).single();
  const links = [
    [Gift, "Rewards", "Create and manage rewards", `/programs/${slug}/manage/rewards`],
    [History, "Redemptions", "Confirm pending reward use", `/programs/${slug}/manage/redemptions`],
    [UsersRound, "Members", "Member tools are next in this scaffold", "#"],
  ] as const;
  return <main className="mx-auto min-h-dvh max-w-xl px-5 py-6"><Link href={`/programs/${slug}`} className="inline-flex size-10 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800"><ArrowLeft className="size-4"/></Link><p className="mt-7 text-sm text-zinc-500">Program management</p><h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em]">{data?.name ?? slug}</h1><p className="mt-2 text-sm text-zinc-500">{data?.program_type ?? "program"}</p><div className="mt-8 divide-y divide-zinc-200 rounded-[24px] border border-zinc-200 bg-white px-4 dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">{links.map(([Icon,title,copy,href])=><Link key={title} href={href} className="flex gap-4 py-5"><Icon className="mt-1 size-5"/><div><p className="font-semibold">{title}</p><p className="mt-1 text-sm text-zinc-500">{copy}</p></div></Link>)}</div></main>;
}
