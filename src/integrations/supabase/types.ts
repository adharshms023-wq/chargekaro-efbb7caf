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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      chargers: {
        Row: {
          address: string
          city: string | null
          connectors: string[]
          created_at: string
          description: string | null
          facilities: string[]
          hours: string
          id: string
          image: string | null
          is_published: boolean
          lat: number
          lng: number
          name: string
          owner_id: string | null
          owner_name: string | null
          payhip_mode: Database["public"]["Enums"]["payhip_mode"] | null
          payhip_product_url: string | null
          phone: string | null
          power_kw: number
          price_per_kwh: number
          rules: string | null
          source: Database["public"]["Enums"]["charger_source"]
          speed: Database["public"]["Enums"]["charging_speed"]
          updated_at: string
        }
        Insert: {
          address: string
          city?: string | null
          connectors?: string[]
          created_at?: string
          description?: string | null
          facilities?: string[]
          hours?: string
          id?: string
          image?: string | null
          is_published?: boolean
          lat: number
          lng: number
          name: string
          owner_id?: string | null
          owner_name?: string | null
          payhip_mode?: Database["public"]["Enums"]["payhip_mode"] | null
          payhip_product_url?: string | null
          phone?: string | null
          power_kw: number
          price_per_kwh?: number
          rules?: string | null
          source?: Database["public"]["Enums"]["charger_source"]
          speed?: Database["public"]["Enums"]["charging_speed"]
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string | null
          connectors?: string[]
          created_at?: string
          description?: string | null
          facilities?: string[]
          hours?: string
          id?: string
          image?: string | null
          is_published?: boolean
          lat?: number
          lng?: number
          name?: string
          owner_id?: string | null
          owner_name?: string | null
          payhip_mode?: Database["public"]["Enums"]["payhip_mode"] | null
          payhip_product_url?: string | null
          phone?: string | null
          power_kw?: number
          price_per_kwh?: number
          rules?: string | null
          source?: Database["public"]["Enums"]["charger_source"]
          speed?: Database["public"]["Enums"]["charging_speed"]
          updated_at?: string
        }
        Relationships: []
      }
      charging_sessions: {
        Row: {
          amount: number
          charger_id: string
          created_at: string
          id: string
          kwh: number | null
          mode: Database["public"]["Enums"]["session_mode"]
          note: string | null
          paid_at: string | null
          payhip_reference: string | null
          status: Database["public"]["Enums"]["session_status"]
          user_id: string | null
        }
        Insert: {
          amount: number
          charger_id: string
          created_at?: string
          id?: string
          kwh?: number | null
          mode: Database["public"]["Enums"]["session_mode"]
          note?: string | null
          paid_at?: string | null
          payhip_reference?: string | null
          status?: Database["public"]["Enums"]["session_status"]
          user_id?: string | null
        }
        Update: {
          amount?: number
          charger_id?: string
          created_at?: string
          id?: string
          kwh?: number | null
          mode?: Database["public"]["Enums"]["session_mode"]
          note?: string | null
          paid_at?: string | null
          payhip_reference?: string | null
          status?: Database["public"]["Enums"]["session_status"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "charging_sessions_charger_id_fkey"
            columns: ["charger_id"]
            isOneToOne: false
            referencedRelation: "chargers"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          charger_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          charger_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          charger_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_charger_id_fkey"
            columns: ["charger_id"]
            isOneToOne: false
            referencedRelation: "chargers"
            referencedColumns: ["id"]
          },
        ]
      }
      live_updates: {
        Row: {
          author_id: string | null
          author_name: string | null
          charger_id: string
          created_at: string
          expires_at: string
          id: string
          kind: string
          message: string
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          charger_id: string
          created_at?: string
          expires_at?: string
          id?: string
          kind: string
          message: string
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          charger_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          kind?: string
          message?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_updates_charger_id_fkey"
            columns: ["charger_id"]
            isOneToOne: false
            referencedRelation: "chargers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          is_host: boolean
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          is_host?: boolean
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_host?: boolean
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_id: string | null
          author_name: string | null
          charger_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          charger_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          charger_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_charger_id_fkey"
            columns: ["charger_id"]
            isOneToOne: false
            referencedRelation: "chargers"
            referencedColumns: ["id"]
          },
        ]
      }
      stations: {
        Row: {
          address: string
          availability: string | null
          brands: string[]
          charging_type: string | null
          city: string | null
          connectors: string[]
          contact_phone: string | null
          created_at: string
          district: string | null
          id: string
          is_published: boolean
          lat: number
          lng: number
          max_power_kw: number | null
          name: string
          operating_hours: string | null
          osm_id: number | null
          photos: string[]
          pricing: string | null
          provider: string | null
          provider_logo: string | null
          rating: number | null
          review_count: number
          updated_at: string
          website: string | null
        }
        Insert: {
          address: string
          availability?: string | null
          brands?: string[]
          charging_type?: string | null
          city?: string | null
          connectors?: string[]
          contact_phone?: string | null
          created_at?: string
          district?: string | null
          id?: string
          is_published?: boolean
          lat: number
          lng: number
          max_power_kw?: number | null
          name: string
          operating_hours?: string | null
          osm_id?: number | null
          photos?: string[]
          pricing?: string | null
          provider?: string | null
          provider_logo?: string | null
          rating?: number | null
          review_count?: number
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string
          availability?: string | null
          brands?: string[]
          charging_type?: string | null
          city?: string | null
          connectors?: string[]
          contact_phone?: string | null
          created_at?: string
          district?: string | null
          id?: string
          is_published?: boolean
          lat?: number
          lng?: number
          max_power_kw?: number | null
          name?: string
          operating_hours?: string | null
          osm_id?: number | null
          photos?: string[]
          pricing?: string | null
          provider?: string | null
          provider_logo?: string | null
          rating?: number | null
          review_count?: number
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_charger_phone: { Args: { _charger_id: string }; Returns: string }
    }
    Enums: {
      charger_source: "public" | "community" | "place"
      charging_speed: "fast" | "slow"
      payhip_mode: "fixed" | "pwyw"
      session_mode: "upfront" | "metered"
      session_status: "pending" | "paid" | "cancelled"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      charger_source: ["public", "community", "place"],
      charging_speed: ["fast", "slow"],
      payhip_mode: ["fixed", "pwyw"],
      session_mode: ["upfront", "metered"],
      session_status: ["pending", "paid", "cancelled"],
    },
  },
} as const
