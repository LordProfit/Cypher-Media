/**
 * Canon Social Platform - Feed Architecture
 * Reference: Clean, brutalist design systems (Dieter Rams meets Notion)
 */

// ============================================================================
// CORE POST SCHEMA
// ============================================================================

interface CanonPost {
  // Identity
  id: string;                    // UUID v4
  slug: string;                  // URL-friendly identifier
  
  // Core Content (The Quote + The Talk)
  quote: {
    text: string;                // The actual quote (1-2 sentences max)
    attribution: string;         // Who said it
    source: BookSource;          // Book reference
  };
  
  talk: {
    text: string;                // Profit's voice — the "why this matters"
    tone: 'direct' | 'provoking' | 'empathetic' | 'brutal';
  };
  
  usage: {
    action: string;              // Specific micro-action
    context: string;             // When/how to apply it
    timeMinutes: number;         // Recommended daily time
  };
  
  // Post Type Classification
  type: PostType;
  
  // Metadata
  category: CategoryTag[];       // 1-3 tags
  difficulty: AIDifficulty;      // How hard to implement
  
  // Engagement
  engagement: EngagementMetrics;
  
  // Reflection (User-generated)
  reflectionPrompt?: string;     // Question to prompt user reflection
  
  // System
  createdAt: ISO8601;
  updatedAt: ISO8601;
  publishedAt: ISO8601;
  isActive: boolean;
}

// ============================================================================
// POST TYPES
// ============================================================================

type PostType = 
  | 'quote-talk-usage'      // Standard: quote + Profit talk + usage
  | 'deep-dive'             // Weekly: longer exploration of one concept
  | 'micro-reflection'      // Prompt-only: "What system failed you today?"
  | 'streak-milestone'      // Celebration of user progress
  | 'community-spotlight';  // User reflection featured

// ============================================================================
// METADATA TYPES
// ============================================================================

interface BookSource {
  title: string;
  author: string;
  chapter?: string;
  page?: number;
  type: 'classic' | 'modern' | 'profit-original';
}

type CategoryTag =
  | 'power'
  | 'discipline'
  | 'systems'
  | 'resilience'
  | 'execution'
  | 'mindset'
  | 'habits'
  | 'leadership'
  | 'friction'
  | 'compliance';

type AIDifficulty = 'easy' | 'medium' | 'hard' | 'brutal';

// ============================================================================
// ENGAGEMENT
// ============================================================================

interface EngagementMetrics {
  likes: number;
  saves: number;               // Bookmark for later
  shares: number;
  reflections: number;         // User wrote a reflection
  completions: number;         // Marked "done" today
}

interface UserInteraction {
  id: string;
  userId: string;
  postId: string;
  type: 'like' | 'save' | 'reflect' | 'complete' | 'share';
  reflectionText?: string;     // If type === 'reflect'
  timestamp: ISO8601;
}

// ============================================================================
// USER & STREAKS
// ============================================================================

interface CanonUser {
  id: string;
  clerkId: string;             // Auth provider ID
  
  // Preferences
  preferredCategories: CategoryTag[];
  dailyTimeGoal: number;       // Minutes per day
  difficultyPreference: AIDifficulty;
  
  // Streaks
  streaks: CategoryStreak[];
  currentStreak: number;       // Overall daily streak
  longestStreak: number;
  
  // Stats
  totalReflections: number;
  totalCompletions: number;
  joinDate: ISO8601;
}

interface CategoryStreak {
  category: CategoryTag;
  currentStreak: number;
  longestStreak: number;
  lastCompletedAt: ISO8601;
}

// ============================================================================
// REFLECTION
// ============================================================================

interface Reflection {
  id: string;
  userId: string;
  postId: string;
  text: string;                // User's written reflection
  isPublic: boolean;           // Can be featured?
  featuredAt?: ISO8601;        // If spotlighted
  likes: number;               // Community appreciation
  createdAt: ISO8601;
}

// ============================================================================
// FEED CONFIGURATION
// ============================================================================

interface FeedConfig {
  userId: string;
  
  // Prioritization weights (0-1)
  weights: {
    streakGap: number;         // Prioritize categories with broken streaks
    newContent: number;        // Fresh quotes
    categoryPreference: number;// User's preferred tags
    difficultyMatch: number;   // Match user's level
    reflectionPrompt: number;  // Micro-reflection slots
  };
  
  // Limits
  dailyQuoteLimit: number;
  deepDiveDay: number;         // 0-6 (Sunday = 0)
  
  // Exclusions
  seenPostIds: string[];       // Don't repeat recent
  completedPostIds: string[];  // Deprioritize done content
}

// ============================================================================
// FEED RESPONSE
// ============================================================================

interface FeedResponse {
  date: ISO8601;
  posts: CanonPost[];
  streakStatus: StreakStatus;
  dailyPrompt?: MicroReflectionPrompt;
}

interface StreakStatus {
  overall: number;
  atRisk: CategoryTag[];       // Streaks about to break
  completed: CategoryTag[];    // Done today
}

interface MicroReflectionPrompt {
  id: string;
  prompt: string;
  category: CategoryTag;
}

// ============================================================================
// TYPE ALIASES
// ============================================================================

type ISO8601 = string;

// ============================================================================
// EXAMPLE POST (JSON)
// ============================================================================

const examplePost: CanonPost = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  slug: "motivation-is-system-failure",
  
  quote: {
    text: "The strongest systems don't need consent. They make compliance the only logical path.",
    attribution: "Profit",
    source: {
      title: "Canon: Systems Over Willpower",
      author: "Arturious Castillo",
      type: "profit-original"
    }
  },
  
  talk: {
    text: "You don't need more discipline. You need a system that makes the wrong choice harder than the right one. Motivation is a feeling. Systems are architecture.",
    tone: "brutal"
  },
  
  usage: {
    action: "Identify one habit you struggle with. Add 20 seconds of friction to the wrong choice.",
    context: "Morning routine, phone usage, diet — wherever you break promises to yourself.",
    timeMinutes: 5
  },
  
  type: "quote-talk-usage",
  category: ["systems", "habits", "discipline"],
  difficulty: "easy",
  
  engagement: {
    likes: 1247,
    saves: 892,
    shares: 334,
    reflections: 156,
    completions: 2089
  },
  
  reflectionPrompt: "What system failed you today? Not your willpower — the system.",
  
  createdAt: "2026-03-05T00:00:00Z",
  updatedAt: "2026-03-05T00:00:00Z",
  publishedAt: "2026-03-05T00:00:00Z",
  isActive: true
};

// ============================================================================
// EXPORT
// ============================================================================

export {
  CanonPost,
  PostType,
  BookSource,
  CategoryTag,
  AIDifficulty,
  EngagementMetrics,
  UserInteraction,
  CanonUser,
  CategoryStreak,
  Reflection,
  FeedConfig,
  FeedResponse,
  StreakStatus,
  MicroReflectionPrompt
};