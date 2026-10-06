import { BarChart3, BadgePercent, Gift, Share2, UsersRound } from "lucide-react";
import { getLocale } from "@/lib/preferences";
import { createClient } from "@/lib/supabase/server";

export default async function AnalyticsPage({ params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, locale, supabase] = await Promise.all([params, getLocale(), createClient()]);
  const th = locale === "th";
  const { data: program } = await supabase.from("programs").select("id,name,currency_name").eq("slug",slug).maybeSingle();
  if(!program) return <main className="p-6 text-sm text-slate-500">{th?"ไม่พบโปรแกรม":"Program not found."}</main>;
  const [members,issued,accounts,rewardCompleted,referrals,referralRewarded,couponClaims,couponRedeemed,tiersResult] = await Promise.all([
    supabase.from("program_members").select("id",{count:"exact",head:true}).eq("program_id",program.id).eq("status","active"),
    supabase.from("point_transactions").select("total:amount.sum()").eq("program_id",program.id).gt("amount",0),
    supabase.from("point_accounts").select("lifetime_earned,lifetime_redeemed").eq("program_id",program.id),
    supabase.from("reward_redemptions").select("id",{count:"exact",head:true}).eq("program_id",program.id).eq("status","completed"),
    supabase.from("referrals").select("id",{count:"exact",head:true}).eq("program_id",program.id),
    supabase.from("referrals").select("id",{count:"exact",head:true}).eq("program_id",program.id).eq("status","rewarded"),
    supabase.from("coupon_redemptions").select("id",{count:"exact",head:true}).eq("program_id",program.id),
    supabase.from("coupon_redemptions").select("id",{count:"exact",head:true}).eq("program_id",program.id).eq("status","redeemed"),
    supabase.from("program_tiers").select("name,min_lifetime_earned").eq("program_id",program.id).eq("active",true).order("min_lifetime_earned"),
  ]);
  const totalIssued=Number(issued.data?.[0]?.total??0);
  const totalRedeemed=(accounts.data??[]).reduce((sum,row)=>sum+Number(row.lifetime_redeemed??0),0);
  const tiers=tiersResult.data??[];
  const distribution=new Map<string,number>();
  for(const account of accounts.data??[]){let label="Member";for(const tier of tiers) if(Number(account.lifetime_earned??0)>=Number(tier.min_lifetime_earned)) label=tier.name;distribution.set(label,(distribution.get(label)??0)+1)}
  const referralRate=(referrals.count??0)>0?((referralRewarded.count??0)/(referrals.count??1))*100:0;
  const couponRate=(couponClaims.count??0)>0?((couponRedeemed.count??0)/(couponClaims.count??1))*100:0;
  return <main className="p-5 sm:p-7 lg:p-8"><div className="mx-auto max-w-6xl"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-[#087F6E]"><BarChart3 className="size-4"/>Insights</p><h1 className="mt-2 text-3xl font-semibold tracking-[-.045em]">{th?"ข้อมูลเชิงลึก":"Insights"}</h1><p className="mt-3 text-sm leading-6 text-slate-500">{th?"ใช้เฉพาะข้อมูลจริงที่มีใน PumpPoint ไม่มีตัวเลขจำลอง":"Only metrics backed by real PumpPoint data are shown here."}</p>
    <section className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4"><Metric icon={UsersRound} value={members.count??0} label={th?"สมาชิกที่ใช้งาน":"Active members"}/><Metric icon={Share2} value={referralRewarded.count??0} label={th?"Referral สำเร็จ":"Referral conversions"}/><Metric icon={Gift} value={rewardCompleted.count??0} label={th?"รางวัลที่ใช้แล้ว":"Rewards redeemed"}/><Metric icon={BadgePercent} value={couponRedeemed.count??0} label={th?"คูปองที่ใช้แล้ว":"Coupons redeemed"}/></section>
    <section className="mt-6 grid gap-4 lg:grid-cols-2"><Panel title={th?"แต้ม":"Points"}><BarRow label={th?"แต้มที่ออกทั้งหมด":"Points issued"} value={totalIssued} max={Math.max(totalIssued,totalRedeemed,1)} suffix={program.currency_name}/><BarRow label={th?"แต้มที่ถูกใช้":"Lifetime redeemed"} value={totalRedeemed} max={Math.max(totalIssued,totalRedeemed,1)} suffix={program.currency_name}/></Panel><Panel title={th?"Growth conversion":"Growth conversion"}><PercentRow icon={Share2} label="Referral" value={referralRate} detail={`${referralRewarded.count??0}/${referrals.count??0}`}/><PercentRow icon={BadgePercent} label="Coupon" value={couponRate} detail={`${couponRedeemed.count??0}/${couponClaims.count??0}`}/></Panel></section>
    <section className="mt-6"><Panel title={th?"การกระจายระดับสมาชิก":"Member tier distribution"}>{distribution.size===0?<p className="text-sm text-slate-500">{th?"ยังไม่มีข้อมูล":"No tier data yet."}</p>:[...distribution.entries()].map(([name,count])=><BarRow key={name} label={name} value={count} max={Math.max(1,accounts.data?.length??0)} suffix={th?"คน":"members"}/>)}</Panel></section>
  </div></main>
}
function Metric({icon:Icon,value,label}:{icon:typeof UsersRound;value:number|string;label:string}){return <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-4"><Icon className="size-5 text-[#087F6E]"/><p className="mt-4 text-2xl font-semibold">{value}</p><p className="mt-1 text-xs text-slate-500">{label}</p></div>}
function Panel({title,children}:{title:string;children:React.ReactNode}){return <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5"><h2 className="font-semibold">{title}</h2><div className="mt-5 grid gap-4">{children}</div></div>}
function BarRow({label,value,max,suffix}:{label:string;value:number;max:number;suffix:string}){return <div><div className="flex items-center justify-between gap-3 text-xs"><span className="font-semibold">{label}</span><span className="text-slate-400">{value.toLocaleString()} {suffix}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"><div className="h-full rounded-full bg-[#10C9A7]" style={{width:`${Math.max(value>0?4:0,Math.min(100,(value/max)*100))}%`}}/></div></div>}
function PercentRow({icon:Icon,label,value,detail}:{icon:typeof Share2;label:string;value:number;detail:string}){return <div><div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm font-semibold"><Icon className="size-4 text-[#087F6E]"/>{label}</span><span className="text-sm font-bold">{value.toFixed(1)}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"><div className="h-full rounded-full bg-[#10C9A7]" style={{width:`${Math.min(100,value)}%`}}/></div><p className="mt-1 text-[10px] text-slate-400">{detail}</p></div>}
