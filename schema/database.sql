-- ============================================================================
-- Canon Platform Database Schema
-- PostgreSQL (Supabase/Neon compatible)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE post_type AS ENUM (
  'quote-talk-usage',
  'deep-dive', 
  'micro-reflection',
  'streak-milestone',
  'community-spotlight'
);

CREATE TYPE category_tag AS ENUM (
  'power',
  'discipline',
  'systems',
  'resilience',
  'execution',
  'mindset',
  'habits',
  'leadership',
  'friction',
  'compliance'
);

CREATE TYPE ai_difficulty AS ENUM ('easy', 'medium', 'hard', 'brutal');

CREATE TYPE talk_tone AS ENUM ('direct', 'provoking', 'empathetic', 'brutal');

CREATE TYPE book_type AS ENUM ('classic', 'modern', 'profit-original');

CREATE TYPE interaction_type AS ENUM ('like', 'save', 'share', 'reflect', 'complete');

-- ============================================================================
-- POSTS TABLE
-- ============================================================================

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  
  -- Quote Content
  quote_text TEXT NOT NULL CHECK (LENGTH(quote_text) BETWEEN 10 AND 280),
  quote_attribution VARCHAR(255) NOT NULL,
  
  -- Source Book
  source_title VARCHAR(255) NOT NULL,
  source_author VARCHAR(255) NOT NULL,
  source_chapter VARCHAR(255),
  source_page INTEGER,
  source_type book_type NOT NULL DEFAULT 'classic',
  
  -- Talk (Profit's Voice)
  talk_text TEXT NOT NULL CHECK (LENGTH(talk_text) BETWEEN 20 AND 500),
  talk_tone talk_tone NOT NULL DEFAULT 'direct',
  
  -- Usage (Actionable)
  usage_action TEXT NOT NULL,
  usage_context TEXT NOT NULL,
  usage_time_minutes INTEGER NOT NULL CHECK (usage_time_minutes BETWEEN 1 AND 120),
  
  -- Classification
  type post_type NOT NULL DEFAULT 'quote-talk-usage',
  difficulty ai_difficulty NOT NULL DEFAULT 'medium',
  
  -- Reflection Prompt
  reflection_prompt VARCHAR(200),
  
  -- Engagement (denormalized for performance)
  likes_count INTEGER NOT NULL DEFAULT 0,
  saves_count INTEGER NOT NULL DEFAULT 0,
  shares_count INTEGER NOT NULL DEFAULT 0,
  reflections_count INTEGER NOT NULL DEFAULT 0,
  completions_count INTEGER NOT NULL DEFAULT 0,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Category tags (many-to-many via array for simplicity)
ALTER TABLE posts ADD COLUMN categories category_tag[] NOT NULL DEFAULT '{}';

-- Indexes
CREATE INDEX idx_posts_type ON posts(type);
CREATE INDEX idx_posts_difficulty ON posts(difficulty);
CREATE INDEX idx_posts_categories ON posts USING GIN(categories);
CREATE INDEX idx_posts_active ON posts(is_active) WHERE is_active = true;
CREATE INDEX idx_posts_published ON posts(published_at DESC);

-- ============================================================================
-- USERS TABLE (extends Clerk auth)
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id VARCHAR(255) UNIQUE NOT NULL,
  
  -- Profile
  email VARCHAR(255) UNIQUE,
  username VARCHAR(50) UNIQUE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  
  -- Preferences
  preferred_categories category_tag[] DEFAULT '{}',
  daily_time_goal INTEGER DEFAULT 10 CHECK (daily_time_goal BETWEEN 1 AND 120),
  difficulty_preference ai_difficulty DEFAULT 'medium',
  
  -- Streaks
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  
  -- Stats
  total_reflections INTEGER NOT NULL DEFAULT 0,
  total_completions INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_clerk ON users(clerk_id);

-- ============================================================================
-- CATEGORY STREAKS (per-user, per-category)
-- ============================================================================

CREATE TABLE category_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category category_tag NOT NULL,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_completed_at TIMESTAMPTZ,
  
  UNIQUE(user_id, category)
);

CREATE INDEX idx_category_streaks_user ON category_streaks(user_id);

-- ============================================================================
-- INTERACTIONS (likes, saves, completions, etc.)
-- ============================================================================

CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  type interaction_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, post_id, type)
);

CREATE INDEX idx_interactions_user ON interactions(user_id);
CREATE INDEX idx_interactions_post ON interactions(post_id);
CREATE INDEX idx_interactions_type ON interactions(type);

-- ============================================================================
-- REFLECTIONS (user-generated content)
-- ============================================================================

CREATE TABLE reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  text TEXT NOT NULL CHECK (LENGTH(text) BETWEEN 10 AND 2000),
  is_public BOOLEAN NOT NULL DEFAULT false,
  featured_at TIMESTAMPTZ,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reflections_user ON reflections(user_id);
CREATE INDEX idx_reflections_post ON reflections(post_id);
CREATE INDEX idx_reflections_public ON reflections(is_public) WHERE is_public = true;
CREATE INDEX idx_reflections_featured ON reflections(featured_at) WHERE featured_at IS NOT NULL;

-- ============================================================================
-- DAILY FEED LOG (what each user saw each day)
-- ============================================================================

CREATE TABLE daily_feeds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  post_ids UUID[] NOT NULL,
  completed_post_ids UUID[] DEFAULT '{}',
  streak_status JSONB, -- {overall: number, atRisk: [], completed: []}
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

CREATE INDEX idx_daily_feeds_user_date ON daily_feeds(user_id, date);

-- ============================================================================
-- POST EMBEDDINGS TABLE (for AI recommendations)
-- ============================================================================

CREATE TABLE post_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  embedding VECTOR(3072) NOT NULL,
  content_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(post_id)
);

CREATE INDEX idx_post_embeddings_post_id ON post_embeddings(post_id);

-- Enable pgvector extension (run this first)
-- CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER reflections_updated_at BEFORE UPDATE ON reflections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Increment engagement counts
CREATE OR REPLACE FUNCTION increment_post_engagement()
RETURNS TRIGGER AS $$
BEGIN
  CASE NEW.type
    WHEN 'like' THEN UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    WHEN 'save' THEN UPDATE posts SET saves_count = saves_count + 1 WHERE id = NEW.post_id;
    WHEN 'share' THEN UPDATE posts SET shares_count = shares_count + 1 WHERE id = NEW.post_id;
    WHEN 'reflect' THEN UPDATE posts SET reflections_count = reflections_count + 1 WHERE id = NEW.post_id;
    WHEN 'complete' THEN UPDATE posts SET completions_count = completions_count + 1 WHERE id = NEW.post_id;
  END CASE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER interaction_engagement AFTER INSERT ON interactions
  FOR EACH ROW EXECUTE FUNCTION increment_post_engagement();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_feeds ENABLE ROW LEVEL SECURITY;

-- Posts: readable by all active, writable by admin only
CREATE POLICY posts_read ON posts FOR SELECT USING (is_active = true);

-- Users: users can only see/update their own
CREATE POLICY users_self ON users FOR ALL USING (auth.uid()::text = clerk_id);

-- Interactions: users can CRUD their own
CREATE POLICY interactions_self ON interactions FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = interactions.user_id AND users.clerk_id = auth.uid()::text)
);

-- Reflections: public ones readable by all, private only by owner
CREATE POLICY reflections_read ON reflections FOR SELECT USING (
  is_public = true OR 
  EXISTS (SELECT 1 FROM users WHERE users.id = reflections.user_id AND users.clerk_id = auth.uid()::text)
);
CREATE POLICY reflections_self ON reflections FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE users.id = reflections.user_id AND users.clerk_id = auth.uid()::text)
);

-- ============================================================================
-- SEED DATA (50-75 quotes)
-- ============================================================================

-- Will be populated via separate seed file
-- Categories: power, discipline, systems, resilience, execution, mindset, habits, leadership, friction, compliance

-- Example seed entry:
-- INSERT INTO posts (slug, quote_text, quote_attribution, source_title, source_author, source_type, talk_text, talk_tone, usage_action, usage_context, usage_time_minutes, categories, difficulty, reflection_prompt)
-- VALUES (
--   'motivation-system-failure',
--   'The strongest systems don''t need consent. They make compliance the only logical path.',
--   'Profit',
--   'Canon: Systems Over Willpower',
--   'Arturious Castillo',
--   'profit-original',
--   'You don''t need more discipline. You need a system that makes the wrong choice harder than the right one. Motivation is a feeling. Systems are architecture.',
--   'brutal',
--   'Identify one habit you struggle with. Add 20 seconds of friction to the wrong choice.',
--   'Morning routine, phone usage, diet — wherever you break promises to yourself.',
--   5,
--   ARRAY['systems', 'habits', 'discipline']::category_tag[],
--   'easy',
--   'What system failed you today? Not your willpower — the system.'
-- );