import type { Locale } from "@/lib/i18n";

const th = {
  metadata: {
    title: "PumpPoint — ทุกการแวะมา ได้มากกว่าเดิม",
    description: "สะสมแต้ม เติมสแตมป์ และปลดล็อกรางวัลจากร้านที่คุณชอบ ทั้งหมดใน PumpPoint",
  },
  nav: {
    product: "ผลิตภัณฑ์", how: "วิธีใช้งาน", rewards: "รางวัล", business: "สำหรับธุรกิจ",
    signIn: "เข้าสู่ระบบ", getStarted: "เริ่มใช้งาน", website: "เมนูเว็บไซต์",
    openMenu: "เปิดเมนู", closeMenu: "ปิดเมนู", home: "หน้าหลัก PumpPoint",
  },
  language: { label: "ภาษา", thai: "ไทย", english: "English", changing: "กำลังเปลี่ยนภาษา" },
  hero: {
    title: "Loyalty ที่ใช้ง่ายแบบไม่ต้องคิดเยอะ",
    description: "สะสมแต้ม เติมบัตรสแตมป์ และปลดล็อกรางวัลจากร้านที่คุณชอบอยู่แล้ว",
    getStarted: "เริ่มใช้งาน", seeHow: "ดูวิธีใช้งาน", proof: "แต้ม · สแตมป์ · รางวัล · QR ในที่เดียว",
  },
  product: {
    eyebrow: "ทุกอย่างอยู่ในที่เดียว", title: "ทุกสิ่งที่ต้องใช้ เพื่อให้ลูกค้ากลับมา",
    description: "ตั้งแต่แต้มแรกจนถึงรางวัล ทุกอย่างถูกออกแบบให้รวดเร็ว ชัดเจน และน่าใช้",
    features: [
      { title: "สะสมแต้ม", copy: "แต้มดิจิทัลที่อัปเดตทันทีทุกครั้งที่แวะมา" },
      { title: "บัตรสแตมป์ดิจิทัล", copy: "เปลี่ยนบัตรกระดาษเป็นประสบการณ์ที่พกไปได้ทุกที่" },
      { title: "สแกน QR", copy: "รับแต้มด้วยการสแกน ไม่ต้องโหลดแอปเพิ่ม" },
      { title: "รางวัลที่อยากได้", copy: "แลกของโปรด ส่วนลด และสิทธิพิเศษจากร้านที่ชอบ" },
      { title: "Smart Wallet", copy: "รวมแต้มและสิทธิ์จากทุกร้านไว้ในที่เดียว" },
      { title: "ข้อมูลสำหรับร้านค้า", copy: "เห็นสมาชิก การกลับมาใช้ซ้ำ และรางวัลยอดนิยมได้ชัดเจน" },
    ],
    walletPreview: { stamps: "3 สแตมป์" },
  },
  how: {
    eyebrow: "เริ่มต้นในไม่กี่วินาที", title: "สแกน สะสม แล้วรับรางวัล",
    steps: [
      { title: "สแกน QR", copy: "สแกนที่ร้านที่เข้าร่วมเมื่อชำระเงิน" },
      { title: "รับแต้มทันที", copy: "แต้มและสแตมป์เข้า Wallet ของคุณทันที" },
      { title: "แลกรางวัล", copy: "ปลดล็อกสิทธิ์แล้วใช้เมื่อคุณพร้อม" },
    ],
  },
  demoSection: {
    eyebrow: "ลองด้วยตัวเอง", title: "ทุกอย่างจบในไม่กี่แตะ",
    description: "แตะดูแต่ละช่วงของประสบการณ์ ตั้งแต่รับแต้มไปจนถึงติดตามทุกอย่างใน Wallet",
  },
  points: {
    eyebrow: "ทุกแต้มมีความหมาย", title: "เห็นความคืบหน้าในทุกครั้งที่กลับมา",
    description: "ยอดแต้มที่ชัดเจน กิจกรรมที่เข้าใจง่าย และเป้าหมายถัดไปที่มองเห็นได้เสมอ",
    balance: "ยอดแต้ม", today: "วันนี้ · 9:42", yesterday: "เมื่อวาน · 18:10", sep28: "28 ก.ย. · 12:22",
    freeCoffee: "กาแฟฟรี",
  },
  stamps: {
    count: "3 / 5 สแตมป์", twoMore: "ครบอีก 2 ดวง รับกาแฟฟรี", noPaper: "ไม่ต้องพกบัตร ไม่ต้องกลัวหาย",
    eyebrow: "เลิกทำบัตรหาย", title: "ความคุ้นเคยของบัตรสแตมป์ โดยไม่ต้องพกบัตร",
    description: "ร้านสร้างเป้าหมายง่ายๆ ลูกค้าเห็นความคืบหน้าชัดๆ แล้วทุกคนก็มีเหตุผลที่จะกลับมา",
    benefits: ["อัปเดตอัตโนมัติทุกครั้งที่สแกน", "ดูได้พร้อมกับแต้มและรางวัล", "ชัดเจนตั้งแต่ดวงแรกถึงของรางวัล"],
  },
  audience: {
    eyebrow: "สร้างคุณค่าให้ทั้งสองฝั่ง", title: "ง่ายสำหรับลูกค้า ทรงพลังสำหรับร้าน",
    customerEyebrow: "สำหรับลูกค้า", customerTitle: "รางวัล ไม่ใช่งานเพิ่ม",
    customerCopy: "เก็บทุกแต้มไว้ที่เดียว รู้เสมอว่าได้อะไร และเหลืออีกเท่าไร", createAccount: "สร้างบัญชี",
    businessEyebrow: "สำหรับร้านค้า", businessTitle: "เปลี่ยนการมาเยือนเป็นความสัมพันธ์",
    businessCopy: "เปิดโปรแกรมได้เร็ว ตั้งรางวัลที่เข้ากับร้าน และเข้าใจว่าสิ่งไหนพาลูกค้ากลับมา", createProgram: "สร้างโปรแกรม",
  },
  analytics: {
    eyebrow: "ข้อมูลที่นำไปใช้ได้", title: "รู้ว่าอะไรทำให้ลูกค้ากลับมา",
    description: "ดูสมาชิก แต้ม การแลก และแนวโน้มการกลับมาใช้ซ้ำจากมุมมองเดียว",
    members: "สมาชิก", pointsIssued: "แต้มที่แจก", redemptions: "แลกรางวัล", repeatVisits: "กลับมาใช้ซ้ำ",
    last7Days: "7 วันที่ผ่านมา", chartLabel: "กราฟแนวโน้มการกลับมาใช้ซ้ำ",
  },
  rewards: {
    eyebrow: "มีบางอย่างให้อยากกลับมา", title: "รางวัลที่เข้ากับชีวิตจริง", viewMine: "ดูรางวัลของฉัน", available: "พร้อมใช้",
    items: ["กาแฟฟรี", "ครัวซองต์ฟรี", "ลด 10%", "สมูทตี้ฟรี"],
  },
  cta: {
    title: "พร้อมทำให้ทุกการกลับมามีคุณค่าหรือยัง?",
    description: "เริ่มสะสมรางวัลในฐานะลูกค้า หรือสร้างโปรแกรมที่ลูกค้าอยากกลับมาใช้",
    getStarted: "เริ่มใช้งานฟรี", buildProgram: "สร้างโปรแกรมสำหรับร้าน",
  },
  footer: {
    tagline: "สะสม แต้ม รับรางวัล แล้วไปได้ไกลกว่าเดิม", exploreHeading: "สำรวจ", product: "ผลิตภัณฑ์",
    rewards: "รางวัล", explore: "ค้นหา", business: "สำหรับร้านค้า", signIn: "เข้าสู่ระบบ", getStarted: "สร้างบัญชี",
  },
  workspace: {
    label: "ตัวอย่าง PumpPoint Wallet แบบโต้ตอบ", overview: "อัปเดตแบบสด", active: "กำลังใช้งาน",
    yourPoints: "แต้มของคุณ", nextTier: "ถึงระดับถัดไป", coffeeCard: "บัตรกาแฟ",
    stampAdded: "เพิ่มสแตมป์แล้ว", visitsToReward: "อีก 2 ครั้งรับรางวัล", reward: "รางวัล",
    recent: "ล่าสุด", justNow: "วันนี้ · เมื่อสักครู่", scanToCollect: "สแกนเพื่อสะสม",
    ready: "พร้อมใช้ที่ร้าน", summary: "แต้ม · สแตมป์ · รางวัล", scanStatus: "กำลังสแกน QR",
    successStatus: "สแกนสำเร็จ", pointsStatus: "เพิ่ม 100 แต้มแล้ว", stampStatus: "เพิ่มสแตมป์แล้ว",
    unlockStatus: "ปลดล็อกรางวัลแล้ว", redeemStatus: "พร้อมแลกรางวัล", redeemedStatus: "แลกรางวัลแล้ว",
    freeCoffee: "กาแฟฟรี", redeem: "แลกรางวัล", redeemed: "แลกแล้ว",
  },
  demo: {
    label: "ตัวอย่างการใช้งาน PumpPoint",
    tabs: [
      { label: "สะสม", copy: "สแกน QR รับแต้มในไม่กี่วินาที" },
      { label: "สแตมป์", copy: "เห็นความคืบหน้าของบัตรแบบเรียลไทม์" },
      { label: "แลก", copy: "แลกรางวัลที่อยากได้แบบชัดเจน" },
      { label: "ติดตาม", copy: "แต้มและกิจกรรมทั้งหมดอยู่ในวอลเล็ตเดียว" },
    ],
    scan: "สแกนเพื่อสะสม", freeCoffeeCard: "บัตรกาแฟฟรี", stamps: "สแตมป์", twoVisits: "อีก 2 ครั้ง รับกาแฟฟรี 1 แก้ว",
    redeemed: "แลกแล้ว", ready: "พร้อมแลก", yourReward: "รางวัลของคุณ", redeemedButton: "แลกรางวัลแล้ว",
    redeemButton: "แลกรางวัล", remaining: "ยอดคงเหลือ 750 pts", afterRedeem: "คงเหลือหลังแลก 750 pts", freeCoffee: "กาแฟฟรี", freePastry: "ครัวซองต์ฟรี",
    wallet: "วอลเล็ต", recent: "กิจกรรมล่าสุด", yourPoints: "แต้มของคุณ", today: "วันนี้",
  },
} as const;

const en = {
  metadata: { title: "PumpPoint — Loyalty that feels effortless", description: "Collect points, complete stamp cards and unlock rewards from the places you already love — all in PumpPoint." },
  nav: { product: "Product", how: "How It Works", rewards: "Rewards", business: "For Business", signIn: "Sign In", getStarted: "Get Started", website: "Website navigation", openMenu: "Open menu", closeMenu: "Close menu", home: "PumpPoint home" },
  language: { label: "Language", thai: "ไทย", english: "English", changing: "Changing language" },
  hero: { title: "Loyalty that feels effortless.", description: "Collect points, complete stamp cards and unlock rewards from the places you already love.", getStarted: "Get Started", seeHow: "See how it works", proof: "Points · stamps · rewards · QR in one place" },
  product: {
    eyebrow: "ONE SIMPLE EXPERIENCE", title: "Everything you need to keep them coming back.", description: "From the first point to the next reward, every interaction stays fast, clear, and genuinely useful.",
    features: [
      { title: "Collect Points", copy: "Digital points that update instantly with every visit." },
      { title: "Digital Stamp Cards", copy: "Turn paper punch cards into an experience customers carry everywhere." },
      { title: "QR Scan", copy: "Collect in seconds with a simple scan and no extra hardware." },
      { title: "Rewards", copy: "Redeem favorites, discounts, and perks from the places you love." },
      { title: "Smart Wallet", copy: "Keep points, stamps, and rewards from every program in one place." },
      { title: "Business Analytics", copy: "See member growth, repeat visits, and reward performance at a glance." },
    ],
    walletPreview: { stamps: "3 stamps" },
  },
  how: { eyebrow: "HOW IT WORKS", title: "Scan. Collect. Reward.", steps: [
    { title: "Scan a QR", copy: "Scan at a participating business when you check out." },
    { title: "Collect instantly", copy: "Points or stamps land in your wallet right away." },
    { title: "Enjoy rewards", copy: "Unlock something worth coming back for and redeem when ready." },
  ] },
  demoSection: { eyebrow: "TRY THE FLOW", title: "A loyalty loop you can feel.", description: "Step through a real product interaction — collect, stamp, redeem, and keep track of it all." },
  points: { eyebrow: "POINTS THAT FEEL REAL", title: "See progress every time you come back.", description: "A clear balance, understandable activity, and a next goal that always feels within reach.", balance: "YOUR BALANCE", today: "Today · 9:42", yesterday: "Yesterday · 18:10", sep28: "Sep 28 · 12:22", freeCoffee: "Free coffee" },
  stamps: { count: "3 / 5 stamps", twoMore: "2 more stamps → free coffee", noPaper: "No card to carry. Nothing to lose.", eyebrow: "DIGITAL STAMP CARDS", title: "The charm of a stamp card, minus the paper.", description: "Businesses set a simple goal, customers see exactly where they stand, and every stamp gives them a reason to return.", benefits: ["Updates automatically with every scan", "Lives alongside points and rewards", "Clear progress from first stamp to reward"] },
  audience: { eyebrow: "BUILT FOR BOTH SIDES", title: "Simple for customers. Powerful for business.", customerEyebrow: "FOR CUSTOMERS", customerTitle: "Rewards, not homework.", customerCopy: "Keep every point in one place, know what you can earn, and see exactly how close you are.", createAccount: "Create an account", businessEyebrow: "FOR BUSINESSES", businessTitle: "Turn visits into relationships.", businessCopy: "Launch quickly, shape rewards around your business, and learn what actually brings customers back.", createProgram: "Create a program" },
  analytics: { eyebrow: "MERCHANT ANALYTICS", title: "Know what keeps customers coming back.", description: "Understand members, point activity, redemptions, and repeat behavior from one calm dashboard.", members: "Members", pointsIssued: "Points issued", redemptions: "Redemptions", repeatVisits: "Repeat visits", last7Days: "Last 7 days", chartLabel: "Repeat visits trend chart" },
  rewards: { eyebrow: "REWARDS WORTH RETURNING FOR", title: "A little something to look forward to.", viewMine: "View my rewards", available: "AVAILABLE", items: ["Free Coffee", "Free Pastry", "10% Off", "Free Smoothie"] },
  cta: { title: "Ready to make every return visit count?", description: "Start collecting as a customer, or launch a loyalty program your customers will actually want to use.", getStarted: "Get Started Free", buildProgram: "Build a business program" },
  footer: { tagline: "Collect. Reward. Go further.", exploreHeading: "Explore", product: "Product", rewards: "Rewards", explore: "Explore", business: "For business", signIn: "Sign in", getStarted: "Get started" },
  workspace: {
    label: "Interactive PumpPoint wallet preview", overview: "Live loyalty overview", active: "ACTIVE", yourPoints: "Your Points", nextTier: "to next tier", coffeeCard: "Coffee Card", stampAdded: "Stamp added", visitsToReward: "2 visits to reward", reward: "Reward", recent: "Recent activity", justNow: "Today · just now", scanToCollect: "Scan to collect", ready: "Ready in-store", summary: "Points · stamps · rewards", scanStatus: "Scanning QR", successStatus: "Scan successful", pointsStatus: "100 points added", stampStatus: "Stamp added", unlockStatus: "Reward unlocked", redeemStatus: "Ready to redeem", redeemedStatus: "Reward redeemed", freeCoffee: "Free Coffee", redeem: "Redeem", redeemed: "Redeemed",
  },
  demo: {
    label: "PumpPoint product demo", tabs: [
      { label: "Collect", copy: "Scan a QR and collect in seconds." },
      { label: "Stamp", copy: "Watch digital stamp progress update instantly." },
      { label: "Redeem", copy: "Redeem rewards with a clear confirmation flow." },
      { label: "Track", copy: "Keep points and activity in one smart wallet." },
    ], scan: "Scan to collect", freeCoffeeCard: "Free Coffee Card", stamps: "stamps", twoVisits: "2 more visits for a free coffee.", redeemed: "Redeemed", ready: "Ready to redeem", yourReward: "Your reward", redeemedButton: "Reward redeemed", redeemButton: "Redeem reward", remaining: "750 pts remaining", afterRedeem: "750 pts balance after redemption", freeCoffee: "Free Coffee", freePastry: "Free Pastry", wallet: "Smart Wallet", recent: "Recent activity", yourPoints: "Your Points", today: "Today",
  },
};

export const landingMessages = { th, en } as const;

export function landingCopy(locale: Locale) {
  return landingMessages[locale];
}
