export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      profile: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          bio: string | null
          profile_image_url: string | null
          location: string | null
          website: string | null
          linkedin_url: string | null
          long_term_goal: string | null
          values_json: string[] | null
          strengths_json: string[] | null
          onboarding_completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          bio?: string | null
          profile_image_url?: string | null
          location?: string | null
          website?: string | null
          linkedin_url?: string | null
          long_term_goal?: string | null
          values_json?: string[] | null
          strengths_json?: string[] | null
          onboarding_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          bio?: string | null
          profile_image_url?: string | null
          location?: string | null
          website?: string | null
          linkedin_url?: string | null
          long_term_goal?: string | null
          values_json?: string[] | null
          strengths_json?: string[] | null
          onboarding_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      privacy_settings: {
        Row: {
          id: string
          user_id: string
          data_retention_days: number
          allow_data_export: boolean
          allow_account_deletion: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          data_retention_days?: number
          allow_data_export?: boolean
          allow_account_deletion?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          data_retention_days?: number
          allow_data_export?: boolean
          allow_account_deletion?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      course_evaluations: {
        Row: {
          id: string
          user_id: string
          course_name: string
          institution: string
          fit_score: number
          reasoning: string
          recommendation: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_name: string
          institution: string
          fit_score: number
          reasoning: string
          recommendation: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_name?: string
          institution?: string
          fit_score?: number
          reasoning?: string
          recommendation?: string
          created_at?: string
          updated_at?: string
        }
      }
      degree_evaluations: {
        Row: {
          id: string
          user_id: string
          degree_name: string
          institution: string
          decision: string
          reasoning: string
          next_steps: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          degree_name: string
          institution: string
          decision: string
          reasoning: string
          next_steps: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          degree_name?: string
          institution?: string
          decision?: string
          reasoning?: string
          next_steps?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      journal_proposals: {
        Row: {
          id: string
          user_id: string
          journal_name: string
          title: string
          abstract: string
          introduction: string
          methodology: string
          expected_outcomes: string
          significance: string
          references: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          journal_name: string
          title: string
          abstract: string
          introduction: string
          methodology: string
          expected_outcomes: string
          significance: string
          references: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          journal_name?: string
          title?: string
          abstract?: string
          introduction?: string
          methodology?: string
          expected_outcomes?: string
          significance?: string
          references?: string
          created_at?: string
          updated_at?: string
        }
      }
      substack_articles: {
        Row: {
          id: string
          user_id: string
          title: string
          topic: string
          mode: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          topic: string
          mode: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          topic?: string
          mode?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      coaching_sessions: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          created_at?: string
          updated_at?: string
        }
      }
      coaching_messages: {
        Row: {
          id: string
          session_id: string
          role: string
          content: string
          action_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          role: string
          content: string
          action_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          role?: string
          content?: string
          action_type?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
