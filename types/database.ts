export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          after_state: Json | null
          before_state: Json | null
          created_at: string
          id: number
          metadata: Json
          program_id: string | null
          resource_id: string | null
          resource_type: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string
          id?: never
          metadata?: Json
          program_id?: string | null
          resource_id?: string | null
          resource_type: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string
          id?: never
          metadata?: Json
          program_id?: string | null
          resource_id?: string | null
          resource_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_events: {
        Row: {
          campaign_id: string
          created_at: string
          event_type: string
          id: string
          metadata: Json
          program_id: string
          user_id: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
          program_id: string
          user_id?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
          program_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_events_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_rules: {
        Row: {
          campaign_id: string
          config: Json
          created_at: string
          id: string
          trigger_type: string
        }
        Insert: {
          campaign_id: string
          config?: Json
          created_at?: string
          id?: string
          trigger_type: string
        }
        Update: {
          campaign_id?: string
          config?: Json
          created_at?: string
          id?: string
          trigger_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_rules_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          name: string
          program_id: string
          starts_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          name: string
          program_id: string
          starts_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          name?: string
          program_id?: string
          starts_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_addressee_id_fkey"
            columns: ["addressee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: Json
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      point_accounts: {
        Row: {
          balance: number
          created_at: string
          id: string
          last_activity_at: string | null
          lifetime_earned: number
          lifetime_redeemed: number
          program_id: string
          reserved_balance: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          last_activity_at?: string | null
          lifetime_earned?: number
          lifetime_redeemed?: number
          program_id: string
          reserved_balance?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          last_activity_at?: string | null
          lifetime_earned?: number
          lifetime_redeemed?: number
          program_id?: string
          reserved_balance?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "point_accounts_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      point_transactions: {
        Row: {
          actor_id: string | null
          amount: number
          created_at: string
          id: string
          idempotency_key: string | null
          metadata: Json
          note: string | null
          program_id: string
          reference_id: string | null
          reversal_of: string | null
          source: string
          status: string
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          amount: number
          created_at?: string
          id?: string
          idempotency_key?: string | null
          metadata?: Json
          note?: string | null
          program_id: string
          reference_id?: string | null
          reversal_of?: string | null
          source?: string
          status?: string
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          amount?: number
          created_at?: string
          id?: string
          idempotency_key?: string | null
          metadata?: Json
          note?: string | null
          program_id?: string
          reference_id?: string | null
          reversal_of?: string | null
          source?: string
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "point_transactions_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_transactions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_transactions_reversal_of_fkey"
            columns: ["reversal_of"]
            isOneToOne: false
            referencedRelation: "point_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          locale: string
          public_profile_enabled: boolean
          theme: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          locale?: string
          public_profile_enabled?: boolean
          theme?: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          locale?: string
          public_profile_enabled?: boolean
          theme?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      program_members: {
        Row: {
          id: string
          joined_at: string
          last_activity_at: string | null
          program_id: string
          status: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          last_activity_at?: string | null
          program_id: string
          status?: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          last_activity_at?: string | null
          program_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_members_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      program_staff: {
        Row: {
          created_at: string
          id: string
          program_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          program_id: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          program_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_staff_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_staff_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          allow_point_transfer: boolean
          color: string | null
          cover_url: string | null
          created_at: string
          currency_name: string
          description: string
          end_date: string | null
          id: string
          join_mode: string
          logo_url: string | null
          name: string
          owner_id: string
          program_type: string
          slug: string
          start_date: string | null
          status: string
          terms: string | null
          updated_at: string
          visibility: string
        }
        Insert: {
          allow_point_transfer?: boolean
          color?: string | null
          cover_url?: string | null
          created_at?: string
          currency_name?: string
          description?: string
          end_date?: string | null
          id?: string
          join_mode?: string
          logo_url?: string | null
          name: string
          owner_id: string
          program_type: string
          slug: string
          start_date?: string | null
          status?: string
          terms?: string | null
          updated_at?: string
          visibility?: string
        }
        Update: {
          allow_point_transfer?: boolean
          color?: string | null
          cover_url?: string | null
          created_at?: string
          currency_name?: string
          description?: string
          end_date?: string | null
          id?: string
          join_mode?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          program_type?: string
          slug?: string
          start_date?: string | null
          status?: string
          terms?: string | null
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "programs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_sessions: {
        Row: {
          action: string
          created_at: string
          creator_id: string
          expires_at: string
          id: string
          payload: Json
          program_id: string | null
          status: string
          token_hash: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          action: string
          created_at?: string
          creator_id: string
          expires_at: string
          id?: string
          payload?: Json
          program_id?: string | null
          status?: string
          token_hash: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          creator_id?: string
          expires_at?: string
          id?: string
          payload?: Json
          program_id?: string | null
          status?: string
          token_hash?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_sessions_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_sessions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_sessions_used_by_fkey"
            columns: ["used_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_redemptions: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          idempotency_key: string
          points_transaction_id: string | null
          program_id: string
          reserved_points: number
          reward_id: string
          stamp_progress_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          idempotency_key: string
          points_transaction_id?: string | null
          program_id: string
          reserved_points?: number
          reward_id: string
          stamp_progress_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          idempotency_key?: string
          points_transaction_id?: string | null
          program_id?: string
          reserved_points?: number
          reward_id?: string
          stamp_progress_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemptions_points_transaction_id_fkey"
            columns: ["points_transaction_id"]
            isOneToOne: false
            referencedRelation: "point_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_stamp_progress_id_fkey"
            columns: ["stamp_progress_id"]
            isOneToOne: false
            referencedRelation: "stamp_progress"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          active: boolean
          created_at: string
          description: string
          expires_at: string | null
          id: string
          image_url: string | null
          max_per_user: number | null
          name: string
          points_required: number | null
          program_id: string
          reward_type: string
          stamps_required: number | null
          start_at: string | null
          stock: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string
          expires_at?: string | null
          id?: string
          image_url?: string | null
          max_per_user?: number | null
          name: string
          points_required?: number | null
          program_id: string
          reward_type: string
          stamps_required?: number | null
          start_at?: string | null
          stock?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string
          expires_at?: string | null
          id?: string
          image_url?: string | null
          max_per_user?: number | null
          name?: string
          points_required?: number | null
          program_id?: string
          reward_type?: string
          stamps_required?: number | null
          start_at?: string | null
          stock?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      stamp_cards: {
        Row: {
          active: boolean
          created_at: string
          expires_in_days: number | null
          id: string
          max_stamps_per_transaction: number
          name: string
          program_id: string
          required_stamps: number
          reset_behavior: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          expires_in_days?: number | null
          id?: string
          max_stamps_per_transaction?: number
          name?: string
          program_id: string
          required_stamps: number
          reset_behavior?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          expires_in_days?: number | null
          id?: string
          max_stamps_per_transaction?: number
          name?: string
          program_id?: string
          required_stamps?: number
          reset_behavior?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stamp_cards_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      stamp_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          program_id: string
          redeemed_at: string | null
          round: number
          stamp_card_id: string
          stamp_count: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          program_id: string
          redeemed_at?: string | null
          round?: number
          stamp_card_id: string
          stamp_count?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          program_id?: string
          redeemed_at?: string | null
          round?: number
          stamp_card_id?: string
          stamp_count?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stamp_progress_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stamp_progress_stamp_card_id_fkey"
            columns: ["stamp_card_id"]
            isOneToOne: false
            referencedRelation: "stamp_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stamp_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stamp_transactions: {
        Row: {
          actor_id: string | null
          amount: number
          created_at: string
          id: string
          idempotency_key: string | null
          note: string | null
          program_id: string
          reference_id: string | null
          stamp_card_id: string
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          amount: number
          created_at?: string
          id?: string
          idempotency_key?: string | null
          note?: string | null
          program_id: string
          reference_id?: string | null
          stamp_card_id: string
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          amount?: number
          created_at?: string
          id?: string
          idempotency_key?: string | null
          note?: string | null
          program_id?: string
          reference_id?: string | null
          stamp_card_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stamp_transactions_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stamp_transactions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stamp_transactions_stamp_card_id_fkey"
            columns: ["stamp_card_id"]
            isOneToOne: false
            referencedRelation: "stamp_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stamp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_qr_session: { Args: { p_token: string }; Returns: Json }
      cancel_redemption: { Args: { p_redemption_id: string }; Returns: Json }
      complete_redemption: { Args: { p_redemption_id: string }; Returns: Json }
      create_qr_session: {
        Args: {
          p_action: string
          p_payload?: Json
          p_program_id: string
          p_ttl_seconds?: number
        }
        Returns: Json
      }
      issue_points: {
        Args: {
          p_amount: number
          p_idempotency_key?: string
          p_member_id: string
          p_note?: string
          p_program_id: string
        }
        Returns: Json
      }
      issue_stamp: {
        Args: {
          p_amount?: number
          p_idempotency_key?: string
          p_member_id: string
          p_note?: string
          p_program_id: string
        }
        Returns: Json
      }
      join_program: { Args: { p_program_id: string }; Returns: Json }
      redeem_reward: {
        Args: { p_idempotency_key?: string; p_reward_id: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
