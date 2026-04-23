export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      children: {
        Row: {
          age_group: string | null
          avatar_color: string | null
          avatar_emoji: string | null
          created_at: string | null
          id: string
          interests: string[] | null
          name: string
          user_id: string
        }
        Insert: {
          age_group?: string | null
          avatar_color?: string | null
          avatar_emoji?: string | null
          created_at?: string | null
          id?: string
          interests?: string[] | null
          name: string
          user_id: string
        }
        Update: {
          age_group?: string | null
          avatar_color?: string | null
          avatar_emoji?: string | null
          created_at?: string | null
          id?: string
          interests?: string[] | null
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "children_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding: {
        Row: {
          calendar_connected: string | null
          completed: boolean | null
          completed_at: string | null
          user_id: string
        }
        Insert: {
          calendar_connected?: string | null
          completed?: boolean | null
          completed_at?: string | null
          user_id: string
        }
        Update: {
          calendar_connected?: string | null
          completed?: boolean | null
          completed_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          free_time_slots: string[] | null
          full_name: string | null
          google_calendar_refresh_token: string | null
          google_calendar_token: string | null
          id: string
          notification_email: boolean
          notification_push: boolean
          paywall_variant: number | null
          streak_freeze_used_at: string | null
          stripe_customer_id: string | null
          subscription_period_end: string | null
          subscription_plan: string
          subscription_status: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          free_time_slots?: string[] | null
          full_name?: string | null
          google_calendar_refresh_token?: string | null
          google_calendar_token?: string | null
          id: string
          notification_email?: boolean
          notification_push?: boolean
          paywall_variant?: number | null
          streak_freeze_used_at?: string | null
          stripe_customer_id?: string | null
          subscription_period_end?: string | null
          subscription_plan?: string
          subscription_status?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          free_time_slots?: string[] | null
          full_name?: string | null
          google_calendar_refresh_token?: string | null
          google_calendar_token?: string | null
          id?: string
          notification_email?: boolean
          notification_push?: boolean
          paywall_variant?: number | null
          streak_freeze_used_at?: string | null
          stripe_customer_id?: string | null
          subscription_period_end?: string | null
          subscription_plan?: string
          subscription_status?: string
        }
        Relationships: []
      }
      saved_moments: {
        Row: {
          accent_color: string | null
          bg_color: string | null
          category: string | null
          child_id: string | null
          completed: boolean | null
          created_at: string | null
          description: string | null
          duration_min: number | null
          id: string
          last_push_sent_at: string | null
          notes: string | null
          photo_url: string | null
          prep_min: number | null
          rating: number | null
          scheduled_at: string | null
          suggestion_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          accent_color?: string | null
          bg_color?: string | null
          category?: string | null
          child_id?: string | null
          completed?: boolean | null
          created_at?: string | null
          description?: string | null
          duration_min?: number | null
          id?: string
          last_push_sent_at?: string | null
          notes?: string | null
          photo_url?: string | null
          prep_min?: number | null
          rating?: number | null
          scheduled_at?: string | null
          suggestion_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          accent_color?: string | null
          bg_color?: string | null
          category?: string | null
          child_id?: string | null
          completed?: boolean | null
          created_at?: string | null
          description?: string | null
          duration_min?: number | null
          id?: string
          last_push_sent_at?: string | null
          notes?: string | null
          photo_url?: string | null
          prep_min?: number | null
          rating?: number | null
          scheduled_at?: string | null
          suggestion_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_moments_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_moments_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "suggestions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_moments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      suggestions: {
        Row: {
          accent_color: string | null
          activity_type: string | null
          bg_color: string | null
          category: string | null
          child_id: string | null
          day_label: string | null
          description: string | null
          duration_min: number | null
          generated_at: string | null
          id: string
          prep_min: number | null
          status: string | null
          time_slot: string | null
          title: string
          user_id: string
          week_number: number | null
        }
        Insert: {
          accent_color?: string | null
          activity_type?: string | null
          bg_color?: string | null
          category?: string | null
          child_id?: string | null
          day_label?: string | null
          description?: string | null
          duration_min?: number | null
          generated_at?: string | null
          id?: string
          prep_min?: number | null
          status?: string | null
          time_slot?: string | null
          title: string
          user_id: string
          week_number?: number | null
        }
        Update: {
          accent_color?: string | null
          activity_type?: string | null
          bg_color?: string | null
          category?: string | null
          child_id?: string | null
          day_label?: string | null
          description?: string | null
          duration_min?: number | null
          generated_at?: string | null
          id?: string
          prep_min?: number | null
          status?: string | null
          time_slot?: string | null
          title?: string
          user_id?: string
          week_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "suggestions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggestions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_scores: {
        Row: {
          created_at: string | null
          hours_total: number | null
          id: string
          moments_count: number | null
          score: number | null
          user_id: string
          week_number: number
          year: number
        }
        Insert: {
          created_at?: string | null
          hours_total?: number | null
          id?: string
          moments_count?: number | null
          score?: number | null
          user_id: string
          week_number: number
          year: number
        }
        Update: {
          created_at?: string | null
          hours_total?: number | null
          id?: string
          moments_count?: number | null
          score?: number | null
          user_id?: string
          week_number?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "weekly_scores_user_id_fkey"
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
      recompute_weekly_score: {
        Args: { p_date: string; p_user_id: string }
        Returns: undefined
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
