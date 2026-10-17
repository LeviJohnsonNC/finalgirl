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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_usage_events: {
        Row: {
          created_at: string
          function_name: string
          id: number
          kind: string | null
          model: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          function_name: string
          id?: number
          kind?: string | null
          model?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          function_name?: string
          id?: number
          kind?: string | null
          model?: string | null
          user_id?: string
        }
        Relationships: []
      }
      game_history: {
        Row: {
          created_at: string
          ending_narration: string | null
          ending_sub_location: string | null
          final_girl: string
          final_girl_health: number | null
          final_horror_level: number | null
          game_highlights: string | null
          id: string
          intro_story: string | null
          killer: string
          killer_health: number | null
          location: string
          outcome: string
          play_events: Json | null
          poster_image_url: string | null
          rounds_played: number | null
          scene_image_url: string | null
          setup_scenario: string | null
          starting_event: string | null
          timestamp: number
          user_id: string
          victims_killed: number | null
          victims_saved: number | null
          visual_bible: string | null
          weapon_used: string | null
        }
        Insert: {
          created_at?: string
          ending_narration?: string | null
          ending_sub_location?: string | null
          final_girl: string
          final_girl_health?: number | null
          final_horror_level?: number | null
          game_highlights?: string | null
          id?: string
          intro_story?: string | null
          killer: string
          killer_health?: number | null
          location: string
          outcome: string
          play_events?: Json | null
          poster_image_url?: string | null
          rounds_played?: number | null
          scene_image_url?: string | null
          setup_scenario?: string | null
          starting_event?: string | null
          timestamp: number
          user_id: string
          victims_killed?: number | null
          victims_saved?: number | null
          visual_bible?: string | null
          weapon_used?: string | null
        }
        Update: {
          created_at?: string
          ending_narration?: string | null
          ending_sub_location?: string | null
          final_girl?: string
          final_girl_health?: number | null
          final_horror_level?: number | null
          game_highlights?: string | null
          id?: string
          intro_story?: string | null
          killer?: string
          killer_health?: number | null
          location?: string
          outcome?: string
          play_events?: Json | null
          poster_image_url?: string | null
          rounds_played?: number | null
          scene_image_url?: string | null
          setup_scenario?: string | null
          starting_event?: string | null
          timestamp?: number
          user_id?: string
          victims_killed?: number | null
          victims_saved?: number | null
          visual_bible?: string | null
          weapon_used?: string | null
        }
        Relationships: []
      }
      play_death_scenes: {
        Row: {
          created_at: string
          event_id: string
          id: string
          lease: string
          lease_until: string
          model: string | null
          scene_text: string | null
          session_id: string
          signature: string
          status: string
          take: number
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          lease?: string
          lease_until?: string
          model?: string | null
          scene_text?: string | null
          session_id: string
          signature: string
          status: string
          take?: number
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          lease?: string
          lease_until?: string
          model?: string | null
          scene_text?: string | null
          session_id?: string
          signature?: string
          status?: string
          take?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "play_death_scenes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "play_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      play_sessions: {
        Row: {
          closed: boolean
          id: string
          revision: number
          state: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          closed?: boolean
          id: string
          revision?: number
          state: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          closed?: boolean
          id?: string
          revision?: number
          state?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_image_settings: {
        Row: {
          auto_generate_images: boolean
          created_at: string
          id: string
          updated_at: string
          use_ai_casting_art: boolean
          user_id: string
        }
        Insert: {
          auto_generate_images?: boolean
          created_at?: string
          id?: string
          updated_at?: string
          use_ai_casting_art?: boolean
          user_id: string
        }
        Update: {
          auto_generate_images?: boolean
          created_at?: string
          id?: string
          updated_at?: string
          use_ai_casting_art?: boolean
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          id: string
          owned_films: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          owned_films?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          owned_films?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_collection_delta: {
        Args: { p_add: string[]; p_remove: string[] }
        Returns: Json
      }
      claim_death_scene: {
        Args: {
          p_event_id: string
          p_session_id: string
          p_signature: string
          p_take: number
          p_user_id: string
        }
        Returns: Json
      }
      get_game_history_summary: { Args: never; Returns: Json[] }
      reserve_ai_usage: {
        Args: {
          p_daily_limit?: number
          p_function_name: string
          p_hourly_limit: number
          p_user_id: string
        }
        Returns: {
          allowed: boolean
          event_id: number
          reason: string
        }[]
      }
      save_play_session: {
        Args: {
          p_closed?: boolean
          p_id: string
          p_revision: number
          p_state: Json
        }
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
