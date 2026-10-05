import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Check,
  Coffee,
  Compass,
  Gift,
  QrCode,
  ScanLine,
  Sparkles,
  Stamp,
  TrendingUp,
  UsersRound,
  WalletCards,
  Zap,
} from "lucide-react";
import { AnimatedCounter } from "@/components/landing/animated-counter";
import { HeroProductWorkspace } from "@/components/landing/hero-product-workspace";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { ProductDemo } from "@/components/landing/product-demo";
import { Brand } from "@/components/brand";
import { authCompletionPathFromLanding } from "@/lib/auth-flow";
import { getLocale } from "@/lib/preferences";

const featureTones = ["mint", "blue", "navy", "yellow", "blue", "mint"] as const;

export default async function LandingPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const completionPath = authCompletionPathFromLanding(await searchParams);
  if (completionPath) redirect(completionPath);

  const locale = await getLocale();
  const th = locale === "th";

  const features = [
    { icon: WalletCards, title: th ? "สะสมแต้ม" : "Collect Points", copy: th ? "แต้มดิจิทัลที่อัปเดตทันทีทุกครั้งที่แวะมา" : "Digital points that update instantly with every visit." },
    { icon: Stamp, title: th ? "บัตรสแตมป์ดิจิทัล" : "Digital Stamp Cards", copy: th ? "เปลี่ยนบัตรกระดาษเป็นประสบการณ์ที่พกไปได้ทุกที่" : "Turn paper punch cards into an experience customers carry everywhere." },
    { icon: QrCode, title: th ? "สแกน QR" : "QR Scan", copy: th ? "รับแต้มด้วยการสแกน ไม่ต้องโหลดแอปเพิ่ม" : "Collect in seconds with a simple scan and no extra hardware." },
    { icon: Gift, title: th ? "รางวัลที่อยากได้" : "Rewards", copy: th ? "แลกของโปรด ส่วนลด และสิทธิพิเศษจากร้านที่ชอบ" : "Redeem favorites, discounts, and perks from the places you love." },
    { icon: Compass, title: th ? "Smart Wallet" : "Smart Wallet", copy: th ? "รวมแต้มและสิทธิ์จากทุกร้านไว้ในที่เดียว" : "Keep points, stamps, and rewards from every program in one place." },
    { icon: BarChart3, title: th ? "ข้อมูลสำหรับร้านค้า" : "Business Analytics", copy: th ? "เห็นสมาชิก การกลับมาใช้ซ้ำ และรางวัลยอดนิยมได้ชัดเจน" : "See member growth, repeat visits, and reward performance at a glance." },
  ];

  const rewards = [
    { emoji: "☕", title: th ? "กาแฟฟรี" : "Free Coffee", points: 500, tone: "bg-[#E6FAF6]" },
    { emoji: "🥐", title: th ? "ครัวซองต์ฟรี" : "Free Pastry", points: 400, tone: "bg-[#FFF4D6]" },
    { emoji: "✨", title: th ? "ลด 10%" : "10% Off", points: 300, tone: "bg-[#EAF2FF]" },
    { emoji: "🥤", title: th ? "สมูทตี้ฟรี" : "Free Smoothie", points: 600, tone: "bg-[#F1EAFE]" },
  ];

  return (
    <main className="landing-page min-h-dvh overflow-x-hidden bg-[var(--background)] text-[var(--foreground)]">
      <LandingNavbar locale={locale} />

      <section className="landing-section mx-auto max-w-7xl px-5 pb-16 pt-[104px] sm:px-8 sm:pb-20 sm:pt-28">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-stretch">
          <div className="landing-reveal flex flex-col justify-center rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 lg:col-span-4">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-[#E6FAF6] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#087F6E]"><Sparkles className="size-3" /> PumpPoint</div>
            <h1 className="max-w-md text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.02] tracking-[-0.055em]">
              {th ? "Loyalty ที่ใช้ง่ายแบบไม่ต้องคิดเยอะ" : "Loyalty that feels effortless."}
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-500 sm:text-base dark:text-slate-400">
              {th ? "สะสมแต้ม เติมบัตรสแตมป์ และปลดล็อกรางวัลจากร้านที่คุณชอบอยู่แล้ว" : "Collect points, complete stamp cards and unlock rewards from the places you already love."}
            </p>
            <div className="mt-6 flex flex-col gap-2 min-[430px]:flex-row lg:flex-col 2xl:flex-row">
              <Link href="/signup" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#10C9A7] px-4 text-sm font-bold text-[#0F2D46] transition hover:-translate-y-px hover:bg-[#0EB99A]">
                {th ? "เริ่มใช้งาน" : "Get Started"}<ArrowRight className="size-4" />
              </Link>
              <Link href="#how" className="inline-flex min-h-11 items-center justify-center gap-1 rounded-xl px-3 text-sm font-bold text-[#0F2D46] transition hover:bg-slate-50 dark:text-white dark:hover:bg-white/5">
                {th ? "ดูวิธีใช้งาน" : "See how it works"}<ArrowRight className="size-3.5" />
              </Link>
            </div>
            <p className="mt-5 flex items-center gap-2 text-[11px] font-medium text-slate-400"><Check className="size-3.5 text-[#10C9A7]" />{th ? "แต้ม · สแตมป์ · รางวัล · QR ในที่เดียว" : "Points · stamps · rewards · QR in one place"}</p>
          </div>

          <div className="landing-reveal min-w-0 lg:col-span-8">
            <HeroProductWorkspace locale={locale} />
          </div>
        </div>
      </section>

      <section id="product" className="landing-section mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="landing-reveal max-w-2xl"><p className="landing-eyebrow">{th ? "ทุกอย่างอยู่ในที่เดียว" : "ONE SIMPLE EXPERIENCE"}</p><h2 className="landing-heading">{th ? "ทุกสิ่งที่ต้องใช้ เพื่อให้ลูกค้ากลับมา" : "Everything you need to keep them coming back."}</h2><p className="landing-subheading">{th ? "ตั้งแต่แต้มแรกจนถึงรางวัล ทุกอย่างถูกออกแบบให้รวดเร็ว ชัดเจน และน่าใช้" : "From the first point to the next reward, every interaction stays fast, clear, and genuinely useful."}</p></div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, copy }, index) => (
            <article key={title} className={`landing-bento landing-bento-${featureTones[index]}`}>
              <div className="flex items-start justify-between"><span className="landing-icon"><Icon className="size-5" /></span><span className="text-xs font-bold text-slate-300">0{index + 1}</span></div>
              <div className="landing-feature-visual" aria-hidden="true">
                {index === 0 && <><span className="text-3xl font-semibold tracking-[-.05em]">1,250</span><span className="ml-1 text-xs font-bold text-[#087F6E]">PTS</span><div className="mt-3 h-1.5 rounded-full bg-black/5"><div className="h-full w-3/4 rounded-full bg-[#10C9A7]" /></div></>}
                {index === 1 && <div className="flex gap-2">{[0,1,2,3,4].map((item) => <span key={item} className={`grid size-9 place-items-center rounded-full border text-xs ${item < 3 ? "border-[#10C9A7] bg-[#10C9A7] text-[#0F2D46]" : "border-slate-200 bg-white text-slate-300"}`}>{item < 3 ? <Coffee className="size-4" /> : item + 1}</span>)}</div>}
                {index === 2 && <div className="relative mx-auto grid size-24 place-items-center rounded-2xl border border-slate-200 bg-white"><QrCode className="size-16 text-[#0F2D46]" /><span className="absolute inset-x-2 top-1/2 h-px bg-[#10C9A7] shadow-[0_0_8px_#10C9A7]" /></div>}
                {index === 3 && <div className="flex items-center gap-3 rounded-xl bg-white/80 p-3"><span className="text-2xl">☕</span><div><p className="text-xs font-bold">Free Coffee</p><p className="mt-0.5 text-[10px] text-slate-500">500 pts</p></div><Check className="ml-auto size-4 text-[#087F6E]" /></div>}
                {index === 4 && <div className="space-y-2">{["Morning Brew", "Studio Nine"].map((name, row) => <div key={name} className="flex items-center gap-2 rounded-lg bg-white/75 p-2"><span className={`size-2 rounded-full ${row ? "bg-[#3B82F6]" : "bg-[#10C9A7]"}`} /><span className="text-[11px] font-semibold">{name}</span><span className="ml-auto text-[10px] text-slate-400">{row ? "3 stamps" : "1,250 pts"}</span></div>)}</div>}
                {index === 5 && <div className="flex h-20 items-end gap-2">{[40,62,48,75,58,88,72].map((height, bar) => <span key={bar} className="flex-1 rounded-t bg-[#10C9A7]/80" style={{ height: `${height}%` }} />)}</div>}
              </div>
              <h3 className="mt-6 text-lg font-semibold tracking-[-.025em]">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how" className="landing-section border-y border-[var(--border)] bg-white/55 dark:bg-white/[.02]">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8"><div className="landing-reveal max-w-2xl"><p className="landing-eyebrow">{th ? "เริ่มต้นในไม่กี่วินาที" : "HOW IT WORKS"}</p><h2 className="landing-heading">{th ? "สแกน สะสม แล้วรับรางวัล" : "Scan. Collect. Reward."}</h2></div>
          <div className="relative mt-14 grid gap-8 md:grid-cols-3 md:gap-10">
            <div className="absolute left-[16%] right-[16%] top-7 hidden h-px bg-gradient-to-r from-[#10C9A7] via-[#3B82F6] to-[#FBBF24] md:block" />
            {[
              [ScanLine, th ? "สแกน QR" : "Scan a QR", th ? "สแกนที่ร้านที่เข้าร่วมเมื่อชำระเงิน" : "Scan at a participating business when you check out."],
              [Zap, th ? "รับแต้มทันที" : "Collect instantly", th ? "แต้มและสแตมป์เข้า Wallet ของคุณทันที" : "Points or stamps land in your wallet right away."],
              [Gift, th ? "แลกรางวัล" : "Enjoy rewards", th ? "ปลดล็อกสิทธิ์แล้วใช้เมื่อคุณพร้อม" : "Unlock something worth coming back for and redeem when ready."],
            ].map(([Icon, title, copy], index) => { const StepIcon = Icon as typeof ScanLine; return <article key={String(title)} className="landing-reveal relative"><span className="relative z-10 grid size-14 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm"><StepIcon className="size-6 text-[#087F6E]" /></span><p className="mt-6 text-xs font-bold text-slate-400">0{index + 1}</p><h3 className="mt-2 text-xl font-semibold tracking-[-.03em]">{String(title)}</h3><p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">{String(copy)}</p></article>; })}
          </div>
        </div>
      </section>

      <section className="landing-section mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div className="landing-reveal"><p className="landing-eyebrow">{th ? "ลองด้วยตัวเอง" : "TRY THE FLOW"}</p><h2 className="landing-heading">{th ? "ทุกอย่างจบในไม่กี่แตะ" : "A loyalty loop you can feel."}</h2><p className="landing-subheading">{th ? "แตะดูแต่ละช่วงของประสบการณ์ ตั้งแต่รับแต้มไปจนถึงติดตามทุกอย่างใน Wallet" : "Step through a real product interaction — collect, stamp, redeem, and keep track of it all."}</p></div>
          <ProductDemo locale={locale} />
        </div>
      </section>

      <section className="landing-section bg-[#0F2D46] text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 sm:px-8 lg:grid-cols-2">
          <div className="landing-reveal"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#72E5D0]">{th ? "ทุกแต้มมีความหมาย" : "POINTS THAT FEEL REAL"}</p><h2 className="landing-heading max-w-xl">{th ? "เห็นความคืบหน้าในทุกครั้งที่กลับมา" : "See progress every time you come back."}</h2><p className="mt-5 max-w-xl text-base leading-7 text-white/60">{th ? "ยอดแต้มที่ชัดเจน กิจกรรมที่เข้าใจง่าย และเป้าหมายถัดไปที่มองเห็นได้เสมอ" : "A clear balance, understandable activity, and a next goal that always feels within reach."}</p></div>
          <div className="landing-reveal rounded-[28px] border border-white/10 bg-white/[.07] p-6 shadow-2xl shadow-black/10 backdrop-blur sm:p-8">
            <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-white/45">{th ? "ยอดแต้ม" : "YOUR BALANCE"}</p><div className="mt-2 flex items-end gap-2"><AnimatedCounter value={1250} className="text-6xl font-semibold tracking-[-.06em]" /><span className="mb-2 text-sm text-[#72E5D0]">pts</span></div></div><WalletCards className="size-7 text-[#72E5D0]" /></div>
            <div className="mt-7 space-y-2">{[["Morning Brew", "+100", "Today · 9:42"], ["Studio Nine", "+50", "Yesterday · 18:10"], ["Free coffee", "−500", "Sep 28 · 12:22"]].map(([name, points, time]) => <div key={name} className="flex items-center rounded-xl bg-white/[.055] p-3"><span className={`mr-3 size-2 rounded-full ${points.startsWith("+") ? "bg-[#10C9A7]" : "bg-[#FBBF24]"}`} /><div><p className="text-sm font-semibold">{name}</p><p className="text-[10px] text-white/35">{time}</p></div><span className="ml-auto text-sm font-bold text-white/75">{points}</span></div>)}</div>
          </div>
        </div>
      </section>

      <section className="landing-section mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 sm:px-8 lg:grid-cols-2">
        <div className="landing-reveal rounded-[30px] bg-[#E6FAF6] p-7 sm:p-10">
          <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#087F6E]">COFFEE CLUB</p><p className="mt-2 text-2xl font-semibold tracking-[-.04em] text-[#0F2D46]">3 / 5 {th ? "สแตมป์" : "stamps"}</p></div><Stamp className="size-7 text-[#087F6E]" /></div>
          <div className="mt-8 grid grid-cols-5 gap-2 sm:gap-3">{[0,1,2,3,4].map((stamp) => <span key={stamp} className={`landing-stamp grid aspect-square place-items-center rounded-full border-2 ${stamp < 3 ? "border-[#10C9A7] bg-[#10C9A7] text-[#0F2D46]" : "border-[#0F2D46]/10 bg-white/70 text-[#0F2D46]/25"}`}><Coffee className="size-5 sm:size-6" /></span>)}</div>
          <div className="mt-7 flex items-center gap-3 rounded-2xl bg-white/65 p-4 text-[#0F2D46]"><Gift className="size-5 text-[#B7791F]" /><div><p className="text-xs font-bold">{th ? "ครบอีก 2 ดวง รับกาแฟฟรี" : "2 more stamps → free coffee"}</p><p className="mt-1 text-[10px] text-slate-500">{th ? "ไม่ต้องพกบัตร ไม่ต้องกลัวหาย" : "No card to carry. Nothing to lose."}</p></div></div>
        </div>
        <div className="landing-reveal"><p className="landing-eyebrow">{th ? "เลิกทำบัตรหาย" : "DIGITAL STAMP CARDS"}</p><h2 className="landing-heading">{th ? "ความคุ้นเคยของบัตรสแตมป์ โดยไม่ต้องพกบัตร" : "The charm of a stamp card, minus the paper."}</h2><p className="landing-subheading">{th ? "ร้านสร้างเป้าหมายง่ายๆ ลูกค้าเห็นความคืบหน้าชัดๆ แล้วทุกคนก็มีเหตุผลที่จะกลับมา" : "Businesses set a simple goal, customers see exactly where they stand, and every stamp gives them a reason to return."}</p><div className="mt-7 space-y-3">{[th ? "อัปเดตอัตโนมัติทุกครั้งที่สแกน" : "Updates automatically with every scan", th ? "ดูได้พร้อมกับแต้มและรางวัล" : "Lives alongside points and rewards", th ? "ชัดเจนตั้งแต่ดวงแรกถึงของรางวัล" : "Clear progress from first stamp to reward"].map((item) => <p key={item} className="flex items-center gap-3 text-sm font-medium"><span className="grid size-5 place-items-center rounded-full bg-[#E6FAF6] text-[#087F6E]"><Check className="size-3" /></span>{item}</p>)}</div></div>
      </section>

      <section id="business" className="landing-section border-y border-[var(--border)] bg-white/60 py-24 dark:bg-white/[.02]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8"><div className="landing-reveal mx-auto max-w-2xl text-center"><p className="landing-eyebrow">{th ? "สร้างคุณค่าให้ทั้งสองฝั่ง" : "BUILT FOR BOTH SIDES"}</p><h2 className="landing-heading">{th ? "ง่ายสำหรับลูกค้า ทรงพลังสำหรับร้าน" : "Simple for customers. Powerful for business."}</h2></div>
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            <article className="landing-audience-card bg-[#E6FAF6] text-[#0F2D46]"><span className="landing-icon bg-white/70 text-[#087F6E]"><UsersRound className="size-5" /></span><p className="mt-8 text-xs font-bold uppercase tracking-[.14em] text-[#087F6E]">{th ? "สำหรับลูกค้า" : "FOR CUSTOMERS"}</p><h3 className="mt-2 text-3xl font-semibold tracking-[-.045em]">{th ? "รางวัล ไม่ใช่งานเพิ่ม" : "Rewards, not homework."}</h3><p className="mt-4 max-w-lg text-sm leading-7 text-[#0F2D46]/65">{th ? "เก็บทุกแต้มไว้ที่เดียว รู้เสมอว่าได้อะไร และเหลืออีกเท่าไร" : "Keep every point in one place, know what you can earn, and see exactly how close you are."}</p><Link href="/signup" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#087F6E]">{th ? "สร้างบัญชี" : "Create an account"}<ArrowRight className="size-4" /></Link></article>
            <article className="landing-audience-card bg-[#0F2D46] text-white"><span className="landing-icon bg-white/10 text-[#72E5D0]"><TrendingUp className="size-5" /></span><p className="mt-8 text-xs font-bold uppercase tracking-[.14em] text-[#72E5D0]">{th ? "สำหรับร้านค้า" : "FOR BUSINESSES"}</p><h3 className="mt-2 text-3xl font-semibold tracking-[-.045em]">{th ? "เปลี่ยนการมาเยือนเป็นความสัมพันธ์" : "Turn visits into relationships."}</h3><p className="mt-4 max-w-lg text-sm leading-7 text-white/60">{th ? "เปิดโปรแกรมได้เร็ว ตั้งรางวัลที่เข้ากับร้าน และเข้าใจว่าสิ่งไหนพาลูกค้ากลับมา" : "Launch quickly, shape rewards around your business, and learn what actually brings customers back."}</p><Link href="/programs/new" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#72E5D0]">{th ? "สร้างโปรแกรม" : "Create a program"}<ArrowRight className="size-4" /></Link></article>
          </div>
        </div>
      </section>

      <section className="landing-section mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[.82fr_1.18fr]">
        <div className="landing-reveal"><p className="landing-eyebrow">{th ? "ข้อมูลที่นำไปใช้ได้" : "MERCHANT ANALYTICS"}</p><h2 className="landing-heading">{th ? "รู้ว่าอะไรทำให้ลูกค้ากลับมา" : "Know what keeps customers coming back."}</h2><p className="landing-subheading">{th ? "ดูสมาชิก แต้ม การแลก และแนวโน้มการกลับมาใช้ซ้ำจากมุมมองเดียว" : "Understand members, point activity, redemptions, and repeat behavior from one calm dashboard."}</p></div>
        <div className="landing-reveal rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_22px_60px_rgba(15,45,70,.08)] sm:p-7">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[["124", th ? "สมาชิก" : "Members"], ["12,400", th ? "แต้มที่แจก" : "Points issued"], ["28", th ? "แลกรางวัล" : "Redemptions"], ["+18%", th ? "กลับมาใช้ซ้ำ" : "Repeat visits"]].map(([value, label]) => <div key={label} className="rounded-xl bg-slate-50 p-3 dark:bg-white/5"><p className="text-xl font-semibold tracking-[-.04em]">{value}</p><p className="mt-1 text-[10px] font-medium text-slate-400">{label}</p></div>)}</div>
          <div className="mt-5 rounded-2xl border border-[var(--border)] p-4"><div className="flex items-center justify-between"><div><p className="text-xs font-bold">{th ? "การกลับมาใช้ซ้ำ" : "Repeat visits"}</p><p className="mt-1 text-[10px] text-slate-400">Last 7 days</p></div><span className="rounded-full bg-[#E6FAF6] px-2 py-1 text-[10px] font-bold text-[#087F6E]">+18%</span></div><svg className="mt-5 h-32 w-full" viewBox="0 0 520 130" role="img" aria-label={th ? "กราฟแนวโน้มการกลับมาใช้ซ้ำ" : "Repeat visits trend chart"}><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#10C9A7" stopOpacity=".24"/><stop offset="1" stopColor="#10C9A7" stopOpacity="0"/></linearGradient></defs><path d="M8 108 C70 101,88 78,140 84 S216 98,264 62 S342 72,386 43 S458 47,512 18 L512 126 L8 126 Z" fill="url(#chartFill)"/><path className="landing-chart-line" d="M8 108 C70 101,88 78,140 84 S216 98,264 62 S342 72,386 43 S458 47,512 18" fill="none" stroke="#10C9A7" strokeWidth="4" strokeLinecap="round"/></svg></div>
        </div>
      </section>

      <section id="rewards" className="landing-section bg-[#F2F6FA] py-24 dark:bg-white/[.025]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8"><div className="landing-reveal flex flex-col justify-between gap-5 md:flex-row md:items-end"><div className="max-w-2xl"><p className="landing-eyebrow">{th ? "มีบางอย่างให้อยากกลับมา" : "REWARDS WORTH RETURNING FOR"}</p><h2 className="landing-heading">{th ? "รางวัลที่เข้ากับชีวิตจริง" : "A little something to look forward to."}</h2></div><Link href="/rewards" className="inline-flex items-center gap-2 text-sm font-bold text-[#087F6E]">{th ? "ดูรางวัลของฉัน" : "View my rewards"}<ArrowRight className="size-4" /></Link></div>
          <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{rewards.map((reward) => <article key={reward.title} className={`landing-reward-card ${reward.tone} min-w-[250px] snap-start sm:min-w-[285px]`}><span className="text-4xl" aria-hidden="true">{reward.emoji}</span><p className="mt-10 text-lg font-semibold tracking-[-.03em] text-[#0F2D46]">{reward.title}</p><div className="mt-3 flex items-center justify-between"><span className="text-xs font-bold text-[#0F2D46]/50">{reward.points} pts</span><span className="rounded-full bg-white/65 px-2.5 py-1 text-[10px] font-bold text-[#087F6E]">AVAILABLE</span></div></article>)}</div>
        </div>
      </section>

      <section className="landing-section mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="landing-reveal relative overflow-hidden rounded-[32px] bg-[linear-gradient(120deg,#0F2D46_0%,#123E5F_55%,#0A7468_145%)] px-6 py-16 text-center text-white sm:px-10 sm:py-20">
          <div className="absolute -left-24 -top-24 size-72 rounded-full bg-[#10C9A7]/15 blur-3xl"/><div className="absolute -bottom-32 -right-20 size-80 rounded-full bg-[#3B82F6]/15 blur-3xl"/>
          <div className="relative mx-auto max-w-2xl"><Sparkles className="mx-auto size-7 text-[#72E5D0]"/><h2 className="mt-5 text-[clamp(2rem,4vw,2.5rem)] font-semibold leading-[1.02] tracking-[-.05em]">{th ? "พร้อมทำให้ทุกการกลับมามีคุณค่าหรือยัง?" : "Ready to make every return visit count?"}</h2><p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-white/60">{th ? "เริ่มสะสมรางวัลในฐานะลูกค้า หรือสร้างโปรแกรมที่ลูกค้าอยากกลับมาใช้" : "Start collecting as a customer, or launch a loyalty program your customers will actually want to use."}</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/signup" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#10C9A7] px-5 text-sm font-bold text-[#0F2D46] transition hover:-translate-y-0.5 hover:bg-[#0EB99A]">{th ? "เริ่มใช้งานฟรี" : "Get Started Free"}<ArrowRight className="size-4"/></Link><Link href="/programs/new" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 bg-white/[.08] px-5 text-sm font-bold text-white transition hover:bg-white/[.13]">{th ? "สร้างโปรแกรมสำหรับร้าน" : "Build a business program"}</Link></div></div>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] bg-white/70 dark:bg-white/[.02]"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.3fr_.7fr_.7fr]"><div><Brand compact/><p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">{th ? "สะสม แต้ม รับรางวัล แล้วไปได้ไกลกว่าเดิม" : "Collect. Reward. Go further."}</p></div><div><p className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">{th ? "สำรวจ" : "Explore"}</p><nav className="mt-4 flex flex-col gap-3 text-sm"><Link href="#product" className="hover:text-[#087F6E]">{th ? "ผลิตภัณฑ์" : "Product"}</Link><Link href="/wallet" className="hover:text-[#087F6E]">Wallet</Link><Link href="/rewards" className="hover:text-[#087F6E]">{th ? "รางวัล" : "Rewards"}</Link><Link href="/explore" className="hover:text-[#087F6E]">{th ? "ค้นหา" : "Explore"}</Link></nav></div><div><p className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">PumpPoint</p><nav className="mt-4 flex flex-col gap-3 text-sm"><Link href="#business" className="hover:text-[#087F6E]">{th ? "สำหรับร้านค้า" : "For business"}</Link><Link href="/login" className="hover:text-[#087F6E]">{th ? "เข้าสู่ระบบ" : "Sign in"}</Link><Link href="/signup" className="hover:text-[#087F6E]">{th ? "สร้างบัญชี" : "Get started"}</Link></nav></div></div><div className="mx-auto max-w-7xl border-t border-[var(--border)] px-5 py-6 text-xs text-slate-400 sm:px-8">© 2026 PumpPoint</div></footer>
    </main>
  );
}
