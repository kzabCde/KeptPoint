import type { Database as GeneratedDatabase, Json } from "@/types/database";

type ProfilesTable = GeneratedDatabase["public"]["Tables"]["profiles"];
type ProgramsTable = GeneratedDatabase["public"]["Tables"]["programs"];
type RewardsTable = GeneratedDatabase["public"]["Tables"]["rewards"];

type ProfilesWithPasswordState = {
  Row: ProfilesTable["Row"] & { password_set: boolean };
  Insert: ProfilesTable["Insert"] & { password_set?: boolean };
  Update: ProfilesTable["Update"] & { password_set?: boolean };
  Relationships: ProfilesTable["Relationships"];
};

type ProgramsWithLoyaltyMechanics = {
  Row: ProgramsTable["Row"] & { point_redemption_enabled: boolean; point_tier_enabled: boolean };
  Insert: ProgramsTable["Insert"] & { point_redemption_enabled?: boolean; point_tier_enabled?: boolean };
  Update: ProgramsTable["Update"] & { point_redemption_enabled?: boolean; point_tier_enabled?: boolean };
  Relationships: ProgramsTable["Relationships"];
};

type RewardsWithStampCard = {
  Row: RewardsTable["Row"] & { stamp_card_id: string | null };
  Insert: RewardsTable["Insert"] & { stamp_card_id?: string | null };
  Update: RewardsTable["Update"] & { stamp_card_id?: string | null };
  Relationships: RewardsTable["Relationships"] | [{ foreignKeyName: "rewards_stamp_card_id_fkey"; columns: ["stamp_card_id"]; isOneToOne: false; referencedRelation: "stamp_cards"; referencedColumns: ["id"] }];
};

type ProgramReferralSettings = {
  Row: { enabled: boolean; program_id: string; referred_bonus: number; referrer_bonus: number; updated_at: string };
  Insert: { enabled?: boolean; program_id: string; referred_bonus?: number; referrer_bonus?: number; updated_at?: string };
  Update: { enabled?: boolean; program_id?: string; referred_bonus?: number; referrer_bonus?: number; updated_at?: string };
  Relationships: [{ foreignKeyName: "program_referral_settings_program_id_fkey"; columns: ["program_id"]; isOneToOne: true; referencedRelation: "programs"; referencedColumns: ["id"] }];
};

type ReferralCodes = {
  Row: { code: string; created_at: string; id: string; program_id: string; user_id: string };
  Insert: { code: string; created_at?: string; id?: string; program_id: string; user_id: string };
  Update: { code?: string; created_at?: string; id?: string; program_id?: string; user_id?: string };
  Relationships: [
    { foreignKeyName: "referral_codes_program_id_fkey"; columns: ["program_id"]; isOneToOne: false; referencedRelation: "programs"; referencedColumns: ["id"] },
    { foreignKeyName: "referral_codes_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
  ];
};

type Referrals = {
  Row: { created_at: string; id: string; program_id: string; referral_code_id: string; referred_id: string; referrer_id: string; rewarded_at: string | null; status: string };
  Insert: { created_at?: string; id?: string; program_id: string; referral_code_id: string; referred_id: string; referrer_id: string; rewarded_at?: string | null; status?: string };
  Update: { created_at?: string; id?: string; program_id?: string; referral_code_id?: string; referred_id?: string; referrer_id?: string; rewarded_at?: string | null; status?: string };
  Relationships: [
    { foreignKeyName: "referrals_program_id_fkey"; columns: ["program_id"]; isOneToOne: false; referencedRelation: "programs"; referencedColumns: ["id"] },
    { foreignKeyName: "referrals_referral_code_id_fkey"; columns: ["referral_code_id"]; isOneToOne: false; referencedRelation: "referral_codes"; referencedColumns: ["id"] },
    { foreignKeyName: "referrals_referred_id_fkey"; columns: ["referred_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
    { foreignKeyName: "referrals_referrer_id_fkey"; columns: ["referrer_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
  ];
};

type Coupons = {
  Row: { active: boolean; code: string; created_at: string; description: string; discount_type: string; discount_value: number | null; expires_at: string | null; id: string; max_per_user: number; max_redemptions: number | null; name: string; program_id: string; starts_at: string | null; updated_at: string };
  Insert: { active?: boolean; code: string; created_at?: string; description?: string; discount_type?: string; discount_value?: number | null; expires_at?: string | null; id?: string; max_per_user?: number; max_redemptions?: number | null; name: string; program_id: string; starts_at?: string | null; updated_at?: string };
  Update: { active?: boolean; code?: string; created_at?: string; description?: string; discount_type?: string; discount_value?: number | null; expires_at?: string | null; id?: string; max_per_user?: number; max_redemptions?: number | null; name?: string; program_id?: string; starts_at?: string | null; updated_at?: string };
  Relationships: [{ foreignKeyName: "coupons_program_id_fkey"; columns: ["program_id"]; isOneToOne: false; referencedRelation: "programs"; referencedColumns: ["id"] }];
};

type CouponRedemptions = {
  Row: { claimed_at: string; coupon_id: string; id: string; program_id: string; redeemed_at: string | null; status: string; user_id: string };
  Insert: { claimed_at?: string; coupon_id: string; id?: string; program_id: string; redeemed_at?: string | null; status?: string; user_id: string };
  Update: { claimed_at?: string; coupon_id?: string; id?: string; program_id?: string; redeemed_at?: string | null; status?: string; user_id?: string };
  Relationships: [
    { foreignKeyName: "coupon_redemptions_coupon_id_fkey"; columns: ["coupon_id"]; isOneToOne: false; referencedRelation: "coupons"; referencedColumns: ["id"] },
    { foreignKeyName: "coupon_redemptions_program_id_fkey"; columns: ["program_id"]; isOneToOne: false; referencedRelation: "programs"; referencedColumns: ["id"] },
    { foreignKeyName: "coupon_redemptions_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
  ];
};

type ProgramTiers = {
  Row: { active: boolean; benefits: Json; created_at: string; id: string; min_lifetime_earned: number; name: string; program_id: string; updated_at: string };
  Insert: { active?: boolean; benefits?: Json; created_at?: string; id?: string; min_lifetime_earned?: number; name: string; program_id: string; updated_at?: string };
  Update: { active?: boolean; benefits?: Json; created_at?: string; id?: string; min_lifetime_earned?: number; name?: string; program_id?: string; updated_at?: string };
  Relationships: [{ foreignKeyName: "program_tiers_program_id_fkey"; columns: ["program_id"]; isOneToOne: false; referencedRelation: "programs"; referencedColumns: ["id"] }];
};

type GrowthFunctions = {
  accept_referral_invite: { Args: { p_code: string; p_program_id: string }; Returns: Json };
  accept_referral_invite_legacy: { Args: { p_code: string }; Returns: Json };
  claim_coupon: { Args: { p_coupon_id: string }; Returns: Json };
  claim_referral: { Args: { p_code: string; p_program_id: string }; Returns: Json };
  get_or_create_referral_code: { Args: { p_program_id: string }; Returns: Json };
  redeem_coupon: { Args: { p_redemption_id: string }; Returns: Json };
};

export type Database = Omit<GeneratedDatabase, "public"> & {
  public: Omit<GeneratedDatabase["public"], "Tables" | "Functions"> & {
    Tables: Omit<GeneratedDatabase["public"]["Tables"], "profiles" | "programs" | "rewards"> & {
      profiles: ProfilesWithPasswordState;
      programs: ProgramsWithLoyaltyMechanics;
      rewards: RewardsWithStampCard;
      program_referral_settings: ProgramReferralSettings;
      referral_codes: ReferralCodes;
      referrals: Referrals;
      coupons: Coupons;
      coupon_redemptions: CouponRedemptions;
      program_tiers: ProgramTiers;
    };
    Functions: GeneratedDatabase["public"]["Functions"] & GrowthFunctions;
  };
};
