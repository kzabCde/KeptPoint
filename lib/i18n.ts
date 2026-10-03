export type Locale = "th" | "en";

export const messages = {
  th: {
    nav: { home: "หน้าหลัก", wallet: "วอลเล็ต", scan: "สแกน", activity: "กิจกรรม", profile: "โปรไฟล์" },
    common: {
      points: "แต้ม", stamps: "สแตมป์", rewards: "รางวัล", favorites: "รายการโปรด", all: "ทั้งหมด",
      manage: "จัดการ", redeem: "แลกรางวัล", manual: "กำหนดเอง", unlimited: "ไม่จำกัด", left: "คงเหลือ",
      public: "สาธารณะ", private: "ส่วนตัว", inviteOnly: "เฉพาะคำเชิญ", hybrid: "ไฮบริด",
      back: "ย้อนกลับ", settings: "การตั้งค่า",
    },
    landing: {
      eyebrow: "วอลเล็ตสะสมแต้มสำหรับทุกคน",
      title: "ทุกแต้มของคุณ เก็บไว้ที่เดียว",
      description: "สร้าง เข้าร่วม สแกน สะสม และแลกรางวัลได้ในบัญชีเดียว ใช้ได้ทั้งลูกค้า เพื่อน ชุมชน และธุรกิจ",
      openDemo: "เปิดแอป", createProgram: "สร้างโปรแกรม",
      pointTitle: "แต้ม", pointCopy: "รวมยอดแต้มจากทุกโปรแกรมไว้ในที่เดียว",
      stampTitle: "สแตมป์", stampCopy: "บัตรสแตมป์ดิจิทัลที่รองรับหลายรอบและรางวัล",
      scanTitle: "สแกน", scanCopy: "QR แบบมีอายุสั้นสำหรับรับแต้ม สแตมป์ และแลกรางวัล",
      signIn: "เข้าสู่ระบบ",
    },
    login: {
      title: "ยินดีต้อนรับกลับ",
      tagline: "เก็บทุกแต้ม ทุกสแตมป์ และทุกรางวัลไว้ด้วยกัน",
      email: "อีเมล", password: "รหัสผ่าน", signIn: "เข้าสู่ระบบ", createAccount: "สร้างบัญชี",
      magic: "ส่งลิงก์เข้าสู่ระบบทางอีเมล", google: "เข้าสู่ระบบด้วย Google",
    },
    home: {
      greeting: "สวัสดี", title: "รางวัลของคุณ", createProgram: "สร้างโปรแกรม",
      recent: "กิจกรรมล่าสุด", seeAll: "ดูทั้งหมด", pointsEarned: "ได้รับแต้ม",
      stampReceived: "ได้รับสแตมป์", rewardRedeemed: "แลกรางวัลแล้ว",
      untilFreeCoffee: "เหลืออีก 120 แต้มรับกาแฟฟรี", stampCard: "บัตรสแตมป์",
    },
    wallet: {
      title: "วอลเล็ต", search: "ค้นหาโปรแกรม", points: "แต้ม", stamps: "สแตมป์",
      rewards: "รางวัล", favorites: "รายการโปรด", stampCard: "บัตรสแตมป์",
    },
    activity: {
      title: "กิจกรรม", earn: "รับแต้ม", redeem: "แลก", transfer: "โอน", stamp: "สแตมป์",
      today: "วันนี้", yesterday: "เมื่อวาน", earned: "ได้รับ", visit: "เยี่ยมชม", freeLatte: "ลาเต้ฟรี",
    },
    scan: {
      title: "สแกน",
      description: "เปิด QR ของ KeptPoint ด้วยกล้อง หรือวางโทเค็นแบบใช้ครั้งเดียว ระบบจะตรวจสอบการกระทำ สิทธิ์ผู้สร้าง วันหมดอายุ และการใช้ซ้ำจากฝั่งเซิร์ฟเวอร์",
      cameraHint: "โครงสร้าง QR พร้อมใช้งานกับตัวสแกนกล้องในแอปโดยไม่ต้องเปลี่ยนโปรโตคอล",
      paste: "วาง QR token", accept: "ยืนยัน QR",
      security: "QR ที่มีความละเอียดอ่อนจะหมดอายุภายใน 15–600 วินาที ค่าเริ่มต้นคือ 90 วินาทีและใช้ได้เพียงครั้งเดียว",
    },
    profile: {
      fallbackName: "ผู้ใช้ KeptPoint", myQr: "QR ของฉัน", myPrograms: "โปรแกรมของฉัน", settings: "การตั้งค่า",
    },
    settings: {
      title: "การตั้งค่า", description: "ปรับภาษาและรูปแบบการแสดงผลของ KeptPoint ให้เหมาะกับคุณ",
      language: "ภาษา", thaiDescription: "ใช้ภาษาไทยทั่วทั้งแอป", englishDescription: "Use English across the app",
      theme: "ธีม", system: "ตามระบบ", light: "สว่าง", dark: "มืด",
      systemDescription: "เปลี่ยนตามโหมดของอุปกรณ์โดยอัตโนมัติ", lightDescription: "ใช้พื้นหลังสว่างตลอดเวลา", darkDescription: "ใช้พื้นหลังมืดตลอดเวลา",
      saving: "กำลังบันทึก…", saved: "บันทึกแล้ว",
      syncNote: "การตั้งค่าจะบันทึกในอุปกรณ์นี้ทันที และหากคุณเข้าสู่ระบบ ระบบจะบันทึกไว้ในโปรไฟล์ของคุณด้วย",
    },
    programNew: {
      step: "ขั้นตอน 1–3", title: "สร้างโปรแกรมสะสมแต้ม", description: "เริ่มด้วยแต้ม สแตมป์ หรือไฮบริด แล้วเพิ่มรางวัลและพนักงานภายหลังได้",
      name: "ชื่อโปรแกรม", slug: "Slug", type: "ประเภท", visibility: "การมองเห็น", descriptionLabel: "รายละเอียด",
      points: "แต้ม", stampCard: "บัตรสแตมป์", hybrid: "ไฮบริด", public: "สาธารณะ", private: "ส่วนตัว", inviteOnly: "เฉพาะคำเชิญ",
      descriptionPlaceholder: "สะสมรางวัลได้ทุกครั้งที่มาใช้บริการ", create: "สร้างโปรแกรม",
    },
    program: {
      notFound: "ไม่พบโปรแกรมหรือโปรแกรมไม่พร้อมใช้งาน", fallbackDescription: "โปรแกรมสะสมแต้มบน KeptPoint",
      available: "ใช้ได้", stampCard: "บัตรสแตมป์", active: "ใช้งานอยู่", join: "เข้าร่วมโปรแกรมนี้",
      rewards: "รางวัล", noRewards: "ยังไม่มีรางวัล", redeem: "แลกรางวัล", scan: "สแกน KeptPoint QR",
      manual: "กำหนดเอง", left: "คงเหลือ",
    },
    manage: {
      eyebrow: "จัดการโปรแกรม", rewards: "รางวัล", rewardsCopy: "สร้างและจัดการรางวัล",
      redemptions: "การแลกรางวัล", redemptionsCopy: "ยืนยันรายการแลกรางวัลที่รอดำเนินการ",
      members: "สมาชิก", membersCopy: "เครื่องมือสมาชิกจะเพิ่มในเวอร์ชันถัดไป",
    },
    rewardsAdmin: {
      notFound: "ไม่พบโปรแกรม", title: "รางวัล", namePlaceholder: "ลาเต้ฟรี", descriptionPlaceholder: "รายละเอียดรางวัล",
      points: "แต้ม", stamps: "สแตมป์", free: "ฟรี", manual: "กำหนดเอง", cost: "จำนวนที่ใช้",
      stock: "สต็อก (เว้นว่าง = ไม่จำกัด)", add: "เพิ่มรางวัล", unlimited: "ไม่จำกัด", left: "คงเหลือ",
    },
    redemptions: {
      title: "รายการรอแลกรางวัล", empty: "ไม่มีรายการรอดำเนินการ", reward: "รางวัล", member: "สมาชิก",
      reserved: "สำรองไว้", points: "แต้ม", confirm: "ยืนยันการแลกรางวัล",
    },
  },
  en: {
    nav: { home: "Home", wallet: "Wallet", scan: "Scan", activity: "Activity", profile: "Profile" },
    common: {
      points: "Points", stamps: "Stamps", rewards: "Rewards", favorites: "Favorites", all: "All",
      manage: "Manage", redeem: "Redeem", manual: "Manual", unlimited: "Unlimited", left: "left",
      public: "Public", private: "Private", inviteOnly: "Invite only", hybrid: "Hybrid",
      back: "Back", settings: "Settings",
    },
    landing: {
      eyebrow: "Universal loyalty wallet",
      title: "Your points, kept.",
      description: "Create, join, scan, collect and redeem. One account works for customers, friends, communities and businesses.",
      openDemo: "Open app", createProgram: "Create a program",
      pointTitle: "Points", pointCopy: "Collect balances from every program in one place.",
      stampTitle: "Stamps", stampCopy: "Digital cards with rounds and rewards.",
      scanTitle: "Scan", scanCopy: "Short-lived QR flows for earning, stamping and redeeming.",
      signIn: "Sign in",
    },
    login: {
      title: "Welcome back.", tagline: "Keep every point, stamp and reward together.",
      email: "Email", password: "Password", signIn: "Sign in", createAccount: "Create account",
      magic: "Email me a magic link", google: "Continue with Google",
    },
    home: {
      greeting: "Hello", title: "Your rewards", createProgram: "Create program",
      recent: "Recent activity", seeAll: "See all", pointsEarned: "Points earned",
      stampReceived: "Stamp received", rewardRedeemed: "Reward redeemed",
      untilFreeCoffee: "120 pts until free coffee", stampCard: "Stamp card",
    },
    wallet: {
      title: "Wallet", search: "Search programs", points: "Points", stamps: "Stamps",
      rewards: "Rewards", favorites: "Favorites", stampCard: "Stamp card",
    },
    activity: {
      title: "Activity", earn: "Earn", redeem: "Redeem", transfer: "Transfer", stamp: "Stamp",
      today: "Today", yesterday: "Yesterday", earned: "Earned", visit: "Visit", freeLatte: "Free latte",
    },
    scan: {
      title: "Scan",
      description: "Open a KeptPoint QR with your device camera or paste its one-time token here. The server validates the action, creator permission, expiry and replay state.",
      cameraHint: "The QR protocol is ready for an in-app camera scanner without changing the token format.",
      paste: "Paste QR token", accept: "Accept QR",
      security: "Sensitive QR sessions expire in 15–600 seconds; the default generated session lasts 90 seconds and can be consumed once.",
    },
    profile: {
      fallbackName: "KeptPoint User", myQr: "My KeptPoint QR", myPrograms: "My programs", settings: "Settings",
    },
    settings: {
      title: "Settings", description: "Choose the language and appearance that work best for you.",
      language: "Language", thaiDescription: "ใช้ภาษาไทยทั่วทั้งแอป", englishDescription: "Use English across the app",
      theme: "Theme", system: "System", light: "Light", dark: "Dark",
      systemDescription: "Follow your device appearance automatically", lightDescription: "Always use the light appearance", darkDescription: "Always use the dark appearance",
      saving: "Saving…", saved: "Saved",
      syncNote: "Preferences are applied immediately on this device and are also saved to your profile when you are signed in.",
    },
    programNew: {
      step: "Step 1–3", title: "Create a loyalty program", description: "Start with points, stamps, or a hybrid program. You can add rewards and staff after creation.",
      name: "Program name", slug: "Slug", type: "Type", visibility: "Visibility", descriptionLabel: "Description",
      points: "Points", stampCard: "Stamp Card", hybrid: "Hybrid", public: "Public", private: "Private", inviteOnly: "Invite only",
      descriptionPlaceholder: "Earn rewards every visit.", create: "Create program",
    },
    program: {
      notFound: "Program not found or unavailable.", fallbackDescription: "A KeptPoint loyalty program.",
      available: "Available", stampCard: "Stamp card", active: "active", join: "Join this program",
      rewards: "Rewards", noRewards: "No rewards yet.", redeem: "Redeem", scan: "Scan KeptPoint QR",
      manual: "Manual", left: "left",
    },
    manage: {
      eyebrow: "Program management", rewards: "Rewards", rewardsCopy: "Create and manage rewards",
      redemptions: "Redemptions", redemptionsCopy: "Confirm pending reward use",
      members: "Members", membersCopy: "Member tools are next in this scaffold",
    },
    rewardsAdmin: {
      notFound: "Program not found.", title: "Rewards", namePlaceholder: "Free latte", descriptionPlaceholder: "Reward description",
      points: "Points", stamps: "Stamps", free: "Free", manual: "Manual", cost: "Cost",
      stock: "Stock (blank = unlimited)", add: "Add reward", unlimited: "Unlimited", left: "left",
    },
    redemptions: {
      title: "Pending redemptions", empty: "No pending redemptions.", reward: "Reward", member: "Member",
      reserved: "reserved", points: "pts", confirm: "Confirm redemption",
    },
  },
} as const;
