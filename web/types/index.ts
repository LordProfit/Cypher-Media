// ============================================================================
// Canon Platform - Type Definitions
// ============================================================================

// Post Types
export type PostType = 
  | 'quote-talk-usage'
  | 'deep-dive'
  | 'micro-reflection'
  | 'streak-milestone'
  | 'community-spotlight';

// Category Tags
export type CategoryTag =
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

// AI Difficulty Levels
export type AIDifficulty = 'easy' | 'medium' | 'hard' | 'brutal';

// Talk Tones
export type TalkTone = 'direct' | 'provoking' | 'empathetic' | 'brutal';

// Book Source Types
export type BookType = 'classic' | 'modern' | 'profit-original';

// Interaction Types
export type InteractionType = 'like' | 'save' | 'share' | 'reflect' | 'complete';

// ============================================================================
// CORE POST INTERFACE
// ============================================================================

export interface BookSource {
  title: string;
  author: string;
  chapter?: string;
  page?: number;
  type: BookType;
}

export interface Quote {
  text: string;
  attribution: string;
  source: BookSource;
}

export interface Talk {
  text: string;
  tone: TalkTone;
}

export interface Usage {
  action: string;
  context: string;
  timeMinutes: number;
}

export interface EngagementMetrics {
  likes: number;
  saves: number;
  shares: number;
  reflections: number;
  completions: number;
}

export interface CanonPost {
  id: string;
  slug: string;
  quote: Quote;
  talk: Talk;
  usage: Usage;
  type: PostType;
  category: CategoryTag[];
  difficulty: AIDifficulty;
  engagement: EngagementMetrics;
  reflectionPrompt?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  isActive: boolean;
}

// ============================================================================
// USER INTERFACES
// ============================================================================

export interface CategoryStreak {
  category: CategoryTag;
  currentStreak: number;
  longestStreak: number;
  lastCompletedAt: string;
}

export interface CanonUser {
  id: string;
  clerkId: string;
  email?: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  preferredCategories: CategoryTag[];
  dailyTimeGoal: number;
  difficultyPreference: AIDifficulty;
  currentStreak: number;
  longestStreak: number;
  lastActivityAt?: string;
  totalReflections: number;
  totalCompletions: number;
  createdAt: string;
}

// ============================================================================
// INTERACTION & REFLECTION
// ============================================================================

export interface UserInteraction {
  id: string;
  userId: string;
  postId: string;
  type: InteractionType;
  reflectionText?: string;
  timestamp: string;
}

export interface Reflection {
  id: string;
  userId: string;
  postId: string;
  text: string;
  isPublic: boolean;
  featuredAt?: string;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// FEED INTERFACES
// ============================================================================

export interface FeedWeights {
  streakGap: number;
  newContent: number;
  categoryPreference: number;
  difficultyMatch: number;
  reflectionPrompt: number;
}

export interface FeedConfig {
  userId: string;
  weights: FeedWeights;
  dailyQuoteLimit: number;
  deepDiveDay: number;
  seenPostIds: string[];
  completedPostIds: string[];
}

export interface StreakStatus {
  overall: number;
  atRisk: CategoryTag[];
  completed: CategoryTag[];
}

export interface MicroReflectionPrompt {
  id: string;
  prompt: string;
  category: CategoryTag;
}

export interface FeedResponse {
  date: string;
  posts: CanonPost[];
  streakStatus: StreakStatus;
  dailyPrompt?: MicroReflectionPrompt;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface PostCardProps {
  post: CanonPost;
  isCompleted?: boolean;
  onInteract?: (type: InteractionType) => void;
  onReflect?: (text: string) => void;
}

export interface CategoryFilterProps {
  categories: CategoryTag[];
  selected: CategoryTag[];
  onToggle: (category: CategoryTag) => void;
}

export interface StreakIndicatorProps {
  streak: number;
  category?: CategoryTag;
  isAtRisk?: boolean;
}