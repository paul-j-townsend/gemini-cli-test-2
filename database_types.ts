export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
  public: {
    Tables: {
      vsk_articles: {
        Row: {
          author: string | null
          category: string | null
          content: string | null
          created_at: string | null
          excerpt: string | null
          id: string
          image_url: string | null
          keywords: string[] | null
          published_at: string | null
          slug: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          keywords?: string[] | null
          published_at?: string | null
          slug: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          keywords?: string[] | null
          published_at?: string | null
          slug?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      vsk_content: {
        Row: {
          archived_description: string | null
          archived_title: string | null
          audio_src: string | null
          category: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string | null
          duration: number | null
          episode_number: number | null
          featured: boolean | null
          file_size: number | null
          full_audio_src: string | null
          id: string
          image_url: string | null
          is_published: boolean | null
          is_purchasable: boolean | null
          meta_description: string | null
          meta_title: string | null
          pass_percentage: number | null
          price_cents: number | null
          published_at: string | null
          quiz_category: string | null
          quiz_description: string | null
          quiz_is_active: boolean | null
          quiz_title: string | null
          season: number | null
          series_id: string | null
          show_notes: string | null
          slug: string | null
          special_offer_active: boolean | null
          special_offer_description: string | null
          special_offer_end_date: string | null
          special_offer_price_cents: number | null
          special_offer_start_date: string | null
          stripe_price_id: string | null
          tags: string[] | null
          thumbnail_path: string | null
          title: string
          total_questions: number | null
          transcript: string | null
          updated_at: string | null
        }
        Insert: {
          archived_description?: string | null
          archived_title?: string | null
          audio_src?: string | null
          category?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          duration?: number | null
          episode_number?: number | null
          featured?: boolean | null
          file_size?: number | null
          full_audio_src?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          is_purchasable?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          pass_percentage?: number | null
          price_cents?: number | null
          published_at?: string | null
          quiz_category?: string | null
          quiz_description?: string | null
          quiz_is_active?: boolean | null
          quiz_title?: string | null
          season?: number | null
          series_id?: string | null
          show_notes?: string | null
          slug?: string | null
          special_offer_active?: boolean | null
          special_offer_description?: string | null
          special_offer_end_date?: string | null
          special_offer_price_cents?: number | null
          special_offer_start_date?: string | null
          stripe_price_id?: string | null
          tags?: string[] | null
          thumbnail_path?: string | null
          title: string
          total_questions?: number | null
          transcript?: string | null
          updated_at?: string | null
        }
        Update: {
          archived_description?: string | null
          archived_title?: string | null
          audio_src?: string | null
          category?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          duration?: number | null
          episode_number?: number | null
          featured?: boolean | null
          file_size?: number | null
          full_audio_src?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          is_purchasable?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          pass_percentage?: number | null
          price_cents?: number | null
          published_at?: string | null
          quiz_category?: string | null
          quiz_description?: string | null
          quiz_is_active?: boolean | null
          quiz_title?: string | null
          season?: number | null
          series_id?: string | null
          show_notes?: string | null
          slug?: string | null
          special_offer_active?: boolean | null
          special_offer_description?: string | null
          special_offer_end_date?: string | null
          special_offer_price_cents?: number | null
          special_offer_start_date?: string | null
          stripe_price_id?: string | null
          tags?: string[] | null
          thumbnail_path?: string | null
          title?: string
          total_questions?: number | null
          transcript?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vsk_content_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "vsk_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vsk_content_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "vsk_series"
            referencedColumns: ["id"]
          },
        ]
      }
      vsk_content_purchases: {
        Row: {
          amount_paid_cents: number
          content_id: string
          created_at: string | null
          currency: string
          id: string
          purchased_at: string | null
          refund_reason: string | null
          refunded_at: string | null
          status: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_paid_cents: number
          content_id: string
          created_at?: string | null
          currency?: string
          id?: string
          purchased_at?: string | null
          refund_reason?: string | null
          refunded_at?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_paid_cents?: number
          content_id?: string
          created_at?: string | null
          currency?: string
          id?: string
          purchased_at?: string | null
          refund_reason?: string | null
          refunded_at?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vsk_content_purchases_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "vsk_active_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vsk_content_purchases_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "vsk_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vsk_content_purchases_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "vsk_deleted_content_with_progress"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vsk_content_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vsk_users"
            referencedColumns: ["id"]
          },
        ]
      }
      vsk_content_question_answers: {
        Row: {
          answer_letter: string
          answer_text: string
          created_at: string | null
          id: string
          is_correct: boolean | null
          question_id: string
        }
        Insert: {
          answer_letter: string
          answer_text: string
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          question_id: string
        }
        Update: {
          answer_letter?: string
          answer_text?: string
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vsk_content_question_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "vsk_content_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      vsk_content_questions: {
        Row: {
          content_id: string
          created_at: string | null
          explanation: string | null
          id: string
          learning_outcome: string | null
          question_number: number
          question_text: string
          rationale: string | null
          updated_at: string | null
        }
        Insert: {
          content_id: string
          created_at?: string | null
          explanation?: string | null
          id?: string
          learning_outcome?: string | null
          question_number: number
          question_text: string
          rationale?: string | null
          updated_at?: string | null
        }
        Update: {
          content_id?: string
          created_at?: string | null
          explanation?: string | null
          id?: string
          learning_outcome?: string | null
          question_number?: number
          question_text?: string
          rationale?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vsk_content_questions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "vsk_active_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vsk_content_questions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "vsk_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vsk_content_questions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "vsk_deleted_content_with_progress"
            referencedColumns: ["id"]
          },
        ]
      }
      vsk_quiz_completions: {
        Row: {
          answers: Json | null
          attempts: number | null
          completed_at: string | null
          content_id: string | null
          content_title: string | null
          created_at: string | null
          id: string
          max_score: number | null
          passed: boolean | null
          percentage: number | null
          podcast_id: string | null
          quiz_id: string | null
          quiz_title: string | null
          score: number | null
          time_spent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          answers?: Json | null
          attempts?: number | null
          completed_at?: string | null
          content_id?: string | null
          content_title?: string | null
          created_at?: string | null
          id?: string
          max_score?: number | null
          passed?: boolean | null
          percentage?: number | null
          podcast_id?: string | null
          quiz_id?: string | null
          quiz_title?: string | null
          score?: number | null
          time_spent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          answers?: Json | null
          attempts?: number | null
          completed_at?: string | null
          content_id?: string | null
          content_title?: string | null
          created_at?: string | null
          id?: string
          max_score?: number | null
          passed?: boolean | null
          percentage?: number | null
          podcast_id?: string | null
          quiz_id?: string | null
          quiz_title?: string | null
          score?: number | null
          time_spent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vsk_quiz_completions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "vsk_active_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vsk_quiz_completions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "vsk_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vsk_quiz_completions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "vsk_deleted_content_with_progress"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vsk_quiz_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vsk_users"
            referencedColumns: ["id"]
          },
        ]
      }
      vsk_series: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          thumbnail_path: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          thumbnail_path?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          thumbnail_path?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vsk_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string | null
          current_period_end: string
          current_period_start: string
          id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          trial_end: string | null
          trial_start: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end: string
          current_period_start: string
          id?: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vsk_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vsk_users"
            referencedColumns: ["id"]
          },
        ]
      }
      vsk_user_content_progress: {
        Row: {
          certificate_downloaded: boolean | null
          certificate_downloaded_at: string | null
          content_id: string
          created_at: string | null
          has_listened: boolean | null
          id: string
          listen_progress_percentage: number | null
          listened_at: string | null
          quiz_completed: boolean | null
          quiz_completed_at: string | null
          report_downloaded: boolean | null
          report_downloaded_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          certificate_downloaded?: boolean | null
          certificate_downloaded_at?: string | null
          content_id: string
          created_at?: string | null
          has_listened?: boolean | null
          id?: string
          listen_progress_percentage?: number | null
          listened_at?: string | null
          quiz_completed?: boolean | null
          quiz_completed_at?: string | null
          report_downloaded?: boolean | null
          report_downloaded_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          certificate_downloaded?: boolean | null
          certificate_downloaded_at?: string | null
          content_id?: string
          created_at?: string | null
          has_listened?: boolean | null
          id?: string
          listen_progress_percentage?: number | null
          listened_at?: string | null
          quiz_completed?: boolean | null
          quiz_completed_at?: string | null
          report_downloaded?: boolean | null
          report_downloaded_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vsk_user_content_progress_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "vsk_active_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vsk_user_content_progress_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "vsk_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vsk_user_content_progress_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "vsk_deleted_content_with_progress"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vsk_user_content_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vsk_users"
            referencedColumns: ["id"]
          },
        ]
      }
      vsk_user_progress: {
        Row: {
          average_score: number | null
          badges: Json | null
          completion_rate: number | null
          created_at: string | null
          id: string
          last_activity_at: string | null
          streak_days: number | null
          total_max_score: number | null
          total_quizzes_completed: number | null
          total_quizzes_passed: number | null
          total_score: number | null
          total_time_spent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          average_score?: number | null
          badges?: Json | null
          completion_rate?: number | null
          created_at?: string | null
          id?: string
          last_activity_at?: string | null
          streak_days?: number | null
          total_max_score?: number | null
          total_quizzes_completed?: number | null
          total_quizzes_passed?: number | null
          total_score?: number | null
          total_time_spent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          average_score?: number | null
          badges?: Json | null
          completion_rate?: number | null
          created_at?: string | null
          id?: string
          last_activity_at?: string | null
          streak_days?: number | null
          total_max_score?: number | null
          total_quizzes_completed?: number | null
          total_quizzes_passed?: number | null
          total_score?: number | null
          total_time_spent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vsk_user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "vsk_users"
            referencedColumns: ["id"]
          },
        ]
      }
      vsk_users: {
        Row: {
          auth_provider: string | null
          avatar: string | null
          avatar_url: string | null
          created_at: string | null
          email: string
          email_verified: boolean | null
          id: string
          last_login_at: string | null
          name: string
          preferences: Json | null
          role: string | null
          status: string | null
          supabase_auth_id: string | null
          updated_at: string | null
        }
        Insert: {
          auth_provider?: string | null
          avatar?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          id?: string
          last_login_at?: string | null
          name: string
          preferences?: Json | null
          role?: string | null
          status?: string | null
          supabase_auth_id?: string | null
          updated_at?: string | null
        }
        Update: {
          auth_provider?: string | null
          avatar?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          id?: string
          last_login_at?: string | null
          name?: string
          preferences?: Json | null
          role?: string | null
          status?: string | null
          supabase_auth_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vsk_valid_keywords: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          keyword: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          keyword: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          keyword?: string
        }
        Relationships: []
      }
    }
    Views: {
      vsk_active_content: {
        Row: {
          archived_description: string | null
          archived_title: string | null
          audio_src: string | null
          category: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string | null
          duration: number | null
          episode_number: number | null
          featured: boolean | null
          file_size: number | null
          full_audio_src: string | null
          id: string | null
          image_url: string | null
          is_published: boolean | null
          is_purchasable: boolean | null
          meta_description: string | null
          meta_title: string | null
          pass_percentage: number | null
          price_cents: number | null
          published_at: string | null
          quiz_category: string | null
          quiz_description: string | null
          quiz_is_active: boolean | null
          quiz_title: string | null
          season: number | null
          series_id: string | null
          show_notes: string | null
          slug: string | null
          special_offer_active: boolean | null
          special_offer_description: string | null
          special_offer_end_date: string | null
          special_offer_price_cents: number | null
          special_offer_start_date: string | null
          stripe_price_id: string | null
          tags: string[] | null
          thumbnail_path: string | null
          title: string | null
          total_questions: number | null
          transcript: string | null
          updated_at: string | null
        }
        Insert: {
          archived_description?: string | null
          archived_title?: string | null
          audio_src?: string | null
          category?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          duration?: number | null
          episode_number?: number | null
          featured?: boolean | null
          file_size?: number | null
          full_audio_src?: string | null
          id?: string | null
          image_url?: string | null
          is_published?: boolean | null
          is_purchasable?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          pass_percentage?: number | null
          price_cents?: number | null
          published_at?: string | null
          quiz_category?: string | null
          quiz_description?: string | null
          quiz_is_active?: boolean | null
          quiz_title?: string | null
          season?: number | null
          series_id?: string | null
          show_notes?: string | null
          slug?: string | null
          special_offer_active?: boolean | null
          special_offer_description?: string | null
          special_offer_end_date?: string | null
          special_offer_price_cents?: number | null
          special_offer_start_date?: string | null
          stripe_price_id?: string | null
          tags?: string[] | null
          thumbnail_path?: string | null
          title?: string | null
          total_questions?: number | null
          transcript?: string | null
          updated_at?: string | null
        }
        Update: {
          archived_description?: string | null
          archived_title?: string | null
          audio_src?: string | null
          category?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          duration?: number | null
          episode_number?: number | null
          featured?: boolean | null
          file_size?: number | null
          full_audio_src?: string | null
          id?: string | null
          image_url?: string | null
          is_published?: boolean | null
          is_purchasable?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          pass_percentage?: number | null
          price_cents?: number | null
          published_at?: string | null
          quiz_category?: string | null
          quiz_description?: string | null
          quiz_is_active?: boolean | null
          quiz_title?: string | null
          season?: number | null
          series_id?: string | null
          show_notes?: string | null
          slug?: string | null
          special_offer_active?: boolean | null
          special_offer_description?: string | null
          special_offer_end_date?: string | null
          special_offer_price_cents?: number | null
          special_offer_start_date?: string | null
          stripe_price_id?: string | null
          tags?: string[] | null
          thumbnail_path?: string | null
          title?: string | null
          total_questions?: number | null
          transcript?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vsk_content_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "vsk_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vsk_content_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "vsk_series"
            referencedColumns: ["id"]
          },
        ]
      }
      vsk_deleted_content_with_progress: {
        Row: {
          archived_description: string | null
          archived_title: string | null
          audio_src: string | null
          category: string | null
          completed_count: number | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string | null
          duration: number | null
          episode_number: number | null
          featured: boolean | null
          file_size: number | null
          full_audio_src: string | null
          id: string | null
          image_url: string | null
          is_published: boolean | null
          is_purchasable: boolean | null
          listened_count: number | null
          meta_description: string | null
          meta_title: string | null
          pass_percentage: number | null
          price_cents: number | null
          published_at: string | null
          quiz_category: string | null
          quiz_description: string | null
          quiz_is_active: boolean | null
          quiz_title: string | null
          season: number | null
          series_id: string | null
          show_notes: string | null
          slug: string | null
          special_offer_active: boolean | null
          special_offer_description: string | null
          special_offer_end_date: string | null
          special_offer_price_cents: number | null
          special_offer_start_date: string | null
          stripe_price_id: string | null
          tags: string[] | null
          thumbnail_path: string | null
          title: string | null
          total_progress_records: number | null
          total_questions: number | null
          transcript: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vsk_content_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "vsk_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vsk_content_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "vsk_series"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

