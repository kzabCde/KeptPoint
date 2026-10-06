import type { Locale } from "@/lib/i18n";

export const productMessages: Record<Locale, {
  workspace: {
    personal: string;
    business: string;
    switchWorkspace: string;
    createProgram: string;
    customerView: string;
    businessHome: string;
  };
  personalNav: {
    home: string;
    wallet: string;
    benefits: string;
    explore: string;
    scan: string;
    activity: string;
    profile: string;
    settings: string;
    notifications: string;
  };
  businessNav: {
    overview: string;
    customers: string;
    loyalty: string;
    rewards: string;
    growth: string;
    operations: string;
    insights: string;
    settings: string;
    manage: string;
    grow: string;
    operate: string;
  };
  business: {
    title: string;
    description: string;
    emptyTitle: string;
    emptyCopy: string;
    openDashboard: string;
  };
  benefits: {
    eyebrow: string;
    title: string;
    description: string;
    rewards: string;
    coupons: string;
    tiers: string;
    referrals: string;
  };
}> = {
  th: {
    workspace: {
      personal: "ส่วนตัว",
      business: "ธุรกิจ",
      switchWorkspace: "สลับพื้นที่ใช้งาน",
      createProgram: "สร้างโปรแกรมใหม่",
      customerView: "กลับมุมมองลูกค้า",
      businessHome: "ร้านค้าของฉัน",
    },
    personalNav: {
      home: "หน้าหลัก",
      wallet: "วอลเล็ต",
      benefits: "สิทธิประโยชน์",
      explore: "ค้นหาร้าน",
      scan: "สแกน",
      activity: "กิจกรรม",
      profile: "โปรไฟล์",
      settings: "การตั้งค่า",
      notifications: "การแจ้งเตือน",
    },
    businessNav: {
      overview: "ภาพรวม",
      customers: "ลูกค้า",
      loyalty: "Loyalty",
      rewards: "รางวัล",
      growth: "Growth",
      operations: "การปฏิบัติงาน",
      insights: "ข้อมูลเชิงลึก",
      settings: "ตั้งค่าโปรแกรม",
      manage: "จัดการ",
      grow: "เติบโต",
      operate: "ดำเนินงาน",
    },
    business: {
      title: "ร้านค้าของฉัน",
      description: "เลือกโปรแกรมที่ต้องการจัดการ หรือสร้างโปรแกรมใหม่โดยใช้บัญชี PumpPoint เดิม",
      emptyTitle: "เปลี่ยนการแวะมาให้กลายเป็นลูกค้าประจำ",
      emptyCopy: "สร้างโปรแกรม Loyalty แรกของคุณ แล้วจัดการแต้ม สแตมป์ รางวัล และแคมเปญได้จากที่เดียว",
      openDashboard: "เปิดแดชบอร์ด",
    },
    benefits: {
      eyebrow: "สิทธิ์ของคุณ",
      title: "สิทธิประโยชน์",
      description: "รวมรางวัล คูปอง ระดับสมาชิก และ Referral จากทุกร้านไว้ในที่เดียว",
      rewards: "รางวัล",
      coupons: "คูปอง",
      tiers: "ระดับสมาชิก",
      referrals: "ชวนเพื่อน",
    },
  },
  en: {
    workspace: {
      personal: "Personal",
      business: "Business",
      switchWorkspace: "Switch workspace",
      createProgram: "Create a program",
      customerView: "Customer view",
      businessHome: "My businesses",
    },
    personalNav: {
      home: "Home",
      wallet: "Wallet",
      benefits: "Benefits",
      explore: "Explore",
      scan: "Scan",
      activity: "Activity",
      profile: "Profile",
      settings: "Settings",
      notifications: "Notifications",
    },
    businessNav: {
      overview: "Overview",
      customers: "Customers",
      loyalty: "Loyalty",
      rewards: "Rewards",
      growth: "Growth",
      operations: "Operations",
      insights: "Insights",
      settings: "Program settings",
      manage: "Manage",
      grow: "Grow",
      operate: "Operate",
    },
    business: {
      title: "My businesses",
      description: "Choose a loyalty program to manage, or create a new one with the same PumpPoint account.",
      emptyTitle: "Turn visits into returning customers.",
      emptyCopy: "Create your first loyalty program and manage points, stamps, rewards, and campaigns in one place.",
      openDashboard: "Open dashboard",
    },
    benefits: {
      eyebrow: "YOUR LOYALTY",
      title: "Benefits",
      description: "Rewards, coupons, member tiers, and referrals from all of your programs in one place.",
      rewards: "Rewards",
      coupons: "Coupons",
      tiers: "Member tiers",
      referrals: "Referrals",
    },
  },
};
