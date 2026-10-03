export type Locale = "th" | "en";

export const messages = {
  en: {
    home: "Home",
    wallet: "Wallet",
    scan: "Scan",
    activity: "Activity",
    profile: "Profile",
    yourRewards: "Your rewards",
    recentActivity: "Recent activity",
    createProgram: "Create program",
  },
  th: {
    home: "หน้าหลัก",
    wallet: "วอลเล็ต",
    scan: "สแกน",
    activity: "กิจกรรม",
    profile: "โปรไฟล์",
    yourRewards: "รางวัลของคุณ",
    recentActivity: "กิจกรรมล่าสุด",
    createProgram: "สร้างโปรแกรม",
  },
} as const;
