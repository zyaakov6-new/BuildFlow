export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          google_calendar_token: string | null
          google_calendar_refresh_token: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          google_calendar_token?: string | null
          google_calendar_refresh_token?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          google_calendar_token?: string | null
          google_calendar_refresh_token?: string | null
          created_at?: string
        }
        Relationships: []
      }
      children: {
        Row: {
          id: string
          user_id: string
          name: string
          age_group: string
          interests: string[]
          avatar_color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          age_group: string
          interests?: string[]
          avatar_color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          age_group?: string
          interests?: string[]
          avatar_color?: string | null
          created_at?: string
        }
        Relationships: []
      }
      suggestions: {
        Row: {
          id: string
          user_id: string
          child_id: string | null
          title: string
          description: string | null
          duration_min: number | null
          prep_min: number | null
          time_slot: string | null
          day_label: string | null
          category: string | null
          activity_type: string | null
          accent_color: string | null
          bg_color: string | null
          status: 'pending' | 'saved' | 'dismissed'
          week_number: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          child_id?: string | null
          title: string
          description?: string | null
          duration_min?: number | null
          prep_min?: number | null
          time_slot?: string | null
          day_label?: string | null
          category?: string | null
          activity_type?: string | null
          accent_color?: string | null
          bg_color?: string | null
          status?: 'pending' | 'saved' | 'dismissed'
          week_number?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          child_id?: string | null
          title?: string
          description?: string | null
          duration_min?: number | null
          prep_min?: number | null
          time_slot?: string | null
          day_label?: string | null
          category?: string | null
          activity_type?: string | null
          accent_color?: string | null
          bg_color?: string | null
          status?: 'pending' | 'saved' | 'dismissed'
          week_number?: number | null
          created_at?: string
        }
        Relationships: []
      }
      saved_moments: {
        Row: {
          id: string
          user_id: string
          suggestion_id: string | null
          child_id: string | null
          title: string
          scheduled_at: string | null
          duration_min: number | null
          notes: string | null
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          suggestion_id?: string | null
          child_id?: string | null
          title: string
          scheduled_at?: string | null
          duration_min?: number | null
          notes?: string | null
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          suggestion_id?: string | null
          child_id?: string | null
          title?: string
          scheduled_at?: string | null
          duration_min?: number | null
          notes?: string | null
          completed?: boolean
          created_at?: string
        }
        Relationships: []
      }
      weekly_scores: {
        Row: {
          id: string
          user_id: string
          week_number: number
          year: number
          score: number | null
          moments_count: number | null
          hours_total: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          week_number: number
          year: number
          score?: number | null
          moments_count?: number | null
          hours_total?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          week_number?: number
          year?: number
          score?: number | null
          moments_count?: number | null
          hours_total?: number | null
          created_at?: string
        }
        Relationships: []
      }
      onboarding: {
        Row: {
          user_id: string
          completed: boolean
          calendar_connected: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          completed?: boolean
          calendar_connected?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          user_id?: string
          completed?: boolean
          calendar_connected?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, Record<string, unknown>>
  }
}
