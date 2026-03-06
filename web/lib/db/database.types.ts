export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type PostType = 'quote-talk-usage' | 'deep-dive' | 'micro-reflection' | 'streak-milestone' | 'community-spotlight'
export type CategoryTag = 'power' | 'discipline' | 'systems' | 'resilience' | 'execution' | 'mindset' | 'habits' | 'leadership' | 'friction' | 'compliance'
export type AIDifficulty = 'easy' | 'medium' | 'hard' | 'brutal'
export type TalkTone = 'direct' | 'provoking' | 'empathetic' | 'brutal'
export type BookType = 'classic' | 'modern' | 'profit-original'
export type InteractionType = 'like' | 'save' | 'share' | 'reflect' | 'complete'

export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string
          slug: string
          quote_text: string
          quote_attribution: string
          source_title: string
          source_author: string
          source_chapter: string | null
          source_page: number | null
          source_type: BookType
          talk_text: string
          talk_tone: TalkTone
          usage_action: string
          usage_context: string
          usage_time_minutes: number
          type: PostType
          difficulty: AIDifficulty
          reflection_prompt: string | null
          likes_count: number
          saves_count: number
          shares_count: number
          reflections_count: number
          completions_count: number
          categories: CategoryTag[]
          is_active: boolean
          created_at: string
          updated_at: string
          published_at: string
        }
        Insert: {
          id?: string
          slug: string
          quote_text: string
          quote_attribution: string
          source_title: string
          source_author: string
          source_chapter?: string | null
          source_page?: number | null
          source_type?: BookType
          talk_text: string
          talk_tone?: TalkTone
          usage_action: string
          usage_context: string
          usage_time_minutes: number
          type?: PostType
          difficulty?: AIDifficulty
          reflection_prompt?: string | null
          likes_count?: number
          saves_count?: number
          shares_count?: number
          reflections_count?: number
          completions_count?: number
          categories?: CategoryTag[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
          published_at?: string
        }
        Update: {
          id?: string
          slug?: string
          quote_text?: string
          quote_attribution?: string
          source_title?: string
          source_author?: string
          source_chapter?: string | null
          source_page?: number | null
          source_type?: BookType
          talk_text?: string
          talk_tone?: TalkTone
          usage_action?: string
          usage_context?: string
          usage_time_minutes?: number
          type?: PostType
          difficulty?: AIDifficulty
          reflection_prompt?: string | null
          likes_count?: number
          saves_count?: number
          shares_count?: number
          reflections_count?: number
          completions_count?: number
          categories?: CategoryTag[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
          published_at?: string
        }
      }
      users: {
        Row: {
          id: string
          clerk_id: string
          email: string | null
          username: string | null
          display_name: string | null
          avatar_url: string | null
          preferred_categories: CategoryTag[]
          daily_time_goal: number
          difficulty_preference: AIDifficulty
          current_streak: number
          longest_streak: number
          last_activity_at: string | null
          total_reflections: number
          total_completions: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clerk_id: string
          email?: string | null
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          preferred_categories?: CategoryTag[]
          daily_time_goal?: number
          difficulty_preference?: AIDifficulty
          current_streak?: number
          longest_streak?: number
          last_activity_at?: string | null
          total_reflections?: number
          total_completions?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clerk_id?: string
          email?: string | null
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          preferred_categories?: CategoryTag[]
          daily_time_goal?: number
          difficulty_preference?: AIDifficulty
          current_streak?: number
          longest_streak?: number
          last_activity_at?: string | null
          total_reflections?: number
          total_completions?: number
          created_at?: string
          updated_at?: string
        }
      }
      interactions: {
        Row: {
          id: string
          user_id: string
          post_id: string
          type: InteractionType
          reflection_text: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          type: InteractionType
          reflection_text?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          type?: InteractionType
          reflection_text?: string | null
          created_at?: string
        }
      }
      reflections: {
        Row: {
          id: string
          user_id: string
          post_id: string
          text: string
          is_public: boolean
          featured_at: string | null
          likes_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          text: string
          is_public?: boolean
          featured_at?: string | null
          likes_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          text?: string
          is_public?: boolean
          featured_at?: string | null
          likes_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      category_streaks: {
        Row: {
          id: string
          user_id: string
          category: CategoryTag
          current_streak: number
          longest_streak: number
          last_completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          category: CategoryTag
          current_streak?: number
          longest_streak?: number
          last_completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          category?: CategoryTag
          current_streak?: number
          longest_streak?: number
          last_completed_at?: string | null
        }
      }
      daily_feeds: {
        Row: {
          id: string
          user_id: string
          date: string
          post_ids: string[]
          completed_post_ids: string[]
          streak_status: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          post_ids?: string[]
          completed_post_ids?: string[]
          streak_status?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          post_ids?: string[]
          completed_post_ids?: string[]
          streak_status?: Json
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