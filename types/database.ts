// Complete database types - matches all Supabase migrations
// Generated from migrations 001-011

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
        }
        Insert: {
          id: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
      }
      profile: {
        Row: {
          user_id: string
          long_term_goal: string | null
          values_json: Json | null
          strengths_json: Json | null
          redaction_map_encrypted: string | null
          created_at: string
          updated_at: string
          onboarding_completed_at: string | null
          auto_delete_sessions_after_days: number | null
          data_retention_days: number | null
          full_name: string | null
          bio: string | null
          profile_image_url: string | null
          location: string | null
          website: string | null
          linkedin_url: string | null
        }
        Insert: {
          user_id: string
          long_term_goal?: string | null
          values_json?: Json | null
          strengths_json?: Json | null
          redaction_map_encrypted?: string | null
          created_at?: string
          updated_at?: string
          onboarding_completed_at?: string | null
          auto_delete_sessions_after_days?: number | null
          data_retention_days?: number | null
          full_name?: string | null
          bio?: string | null
          profile_image_url?: string | null
          location?: string | null
          website?: string | null
          linkedin_url?: string | null
        }
        Update: {
          user_id?: string
          long_term_goal?: string | null
          values_json?: Json | null
          strengths_json?: Json | null
          redaction_map_encrypted?: string | null
          created_at?: string
          updated_at?: string
          onboarding_completed_at?: string | null
          auto_delete_sessions_after_days?: number | null
          data_retention_days?: number | null
          full_name?: string | null
          bio?: string | null
          profile_image_url?: string | null
          location?: string | null
          website?: string | null
          linkedin_url?: string | null
        }
      }
      docs: {
        Row: {
          id: string
          user_id: string
          type: string
          storage_path: string
          meta_encrypted: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          storage_path: string
          meta_encrypted?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          storage_path?: string
          meta_encrypted?: string | null
          created_at?: string
        }
      }
      embeddings: {
        Row: {
          id: string
          doc_id: string
          chunk_redacted: string
          vector: string | null
          metadata_json: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          doc_id: string
          chunk_redacted: string
          vector?: string | null
          metadata_json?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          doc_id?: string
          chunk_redacted?: string
          vector?: string | null
          metadata_json?: Json | null
          created_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          title: string
          active_goal: string | null
          active_values_json: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          active_goal?: string | null
          active_values_json?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          active_goal?: string | null
          active_values_json?: Json | null
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          session_id: string
          role: string
          content_redacted: string
          content_encrypted: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          role: string
          content_redacted: string
          content_encrypted?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          role?: string
          content_redacted?: string
          content_encrypted?: string | null
          created_at?: string
        }
      }
      letters: {
        Row: {
          id: string
          user_id: string
          job_meta_json: Json | null
          draft_html: string
          draft_txt: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          job_meta_json?: Json | null
          draft_html: string
          draft_txt: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          job_meta_json?: Json | null
          draft_html?: string
          draft_txt?: string
          created_at?: string
        }
      }
      cv_versions: {
        Row: {
          id: string
          user_id: string
          base_doc_id: string
          job_meta_json: Json | null
          diff_summary: string | null
          file_paths_json: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          base_doc_id: string
          job_meta_json?: Json | null
          diff_summary?: string | null
          file_paths_json?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          base_doc_id?: string
          job_meta_json?: Json | null
          diff_summary?: string | null
          file_paths_json?: Json | null
          created_at?: string
        }
      }
      course_evaluations: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          provider: string | null
          cost: number | null
          duration_weeks: number | null
          input_data: Json | null
          analysis_result: Json | null
          score: number | null
          recommendation: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          provider?: string | null
          cost?: number | null
          duration_weeks?: number | null
          input_data?: Json | null
          analysis_result?: Json | null
          score?: number | null
          recommendation?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          provider?: string | null
          cost?: number | null
          duration_weeks?: number | null
          input_data?: Json | null
          analysis_result?: Json | null
          score?: number | null
          recommendation?: string | null
          created_at?: string
        }
      }
      journal_proposals: {
        Row: {
          id: string
          user_id: string
          proposal_meta_json: Json | null
          research_question: string
          research_context: string | null
          methodology: string | null
          contribution: string | null
          references_text: string | null
          draft_txt: string
          draft_html: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          proposal_meta_json?: Json | null
          research_question: string
          research_context?: string | null
          methodology?: string | null
          contribution?: string | null
          references_text?: string | null
          draft_txt: string
          draft_html: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          proposal_meta_json?: Json | null
          research_question?: string
          research_context?: string | null
          methodology?: string | null
          contribution?: string | null
          references_text?: string | null
          draft_txt?: string
          draft_html?: string
          created_at?: string
        }
      }
      substack_articles: {
        Row: {
          id: string
          user_id: string
          mode: string
          article_meta_json: Json | null
          input_text: string | null
          draft_txt: string
          draft_html: string | null
          draft_markdown: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mode: string
          article_meta_json?: Json | null
          input_text?: string | null
          draft_txt: string
          draft_html?: string | null
          draft_markdown?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mode?: string
          article_meta_json?: Json | null
          input_text?: string | null
          draft_txt?: string
          draft_html?: string | null
          draft_markdown?: string | null
          created_at?: string
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
