import { createServerClient } from '@/lib/db/supabase';
import { generateEmbedding, findSimilar, generateRecommendationReason } from './embeddings';

export interface PostWithEmbedding {
  id: string;
  quote_text: string;
  talk_text: string;
  usage_action: string;
  categories: string[];
  embedding: number[];
}

export interface UserProfile {
  id: string;
  preferred_categories: string[];
  difficulty_preference: string;
  recent_interactions: string[];
  category_streaks: string[];
}

/**
 * Generate and store embedding for a post
 */
export async function embedPost(postId: string): Promise<void> {
  const supabase = createServerClient();

  // Get post content
  const { data: post } = await supabase
    .from('posts')
    .select('quote_text, talk_text, usage_action, categories')
    .eq('id', postId)
    .single();

  if (!post) return;

  // Combine content for embedding
  const contentToEmbed = `
Quote: ${(post as any).quote_text}
Talk: ${(post as any).talk_text}
Action: ${(post as any).usage_action}
Categories: ${(post as any).categories?.join(', ')}
  `.trim();

  // Generate embedding
  const embedding = await generateEmbedding(contentToEmbed);

  // Store in database (using a new table for embeddings)
  const { error } = await supabase
    .from('post_embeddings')
    .upsert({
      post_id: postId,
      embedding: embedding,
      content_hash: hashContent(contentToEmbed),
    } as any, {
      onConflict: 'post_id'
    });

  if (error) {
    console.error('Failed to store embedding:', error);
  }
}

/**
 * Get personalized recommendations for a user
 */
export async function getRecommendations(
  userId: string,
  limit: number = 5
): Promise<any[]> {
  const supabase = createServerClient();

  // Get user profile
  const { data: user } = await supabase
    .from('users')
    .select('preferred_categories, difficulty_preference')
    .eq('id', userId)
    .single();

  // Get user's recent interactions for context
  const { data: interactions } = await supabase
    .from('interactions')
    .select('post_id, type, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  // Get posts user has already seen
  const seenPostIds = interactions?.map((i: any) => i.post_id) || [];

  // Get user's category streaks
  const { data: streaks } = await supabase
    .from('category_streaks')
    .select('category')
    .eq('user_id', userId)
    .gt('current_streak', 0);

  const streakCategories = streaks?.map((s: any) => s.category) || [];

  // Build user profile embedding context
  const userContext = {
    preferred_categories: (user as any)?.preferred_categories || [],
    recent_interactions: interactions?.map((i: any) => i.type) || [],
    streak_categories: streakCategories,
  };

  // For now, use category-based filtering + recency
  // In production, this would use vector similarity search
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('is_active', true)
    .not('id', 'in', `(${seenPostIds.join(',')})`)
    .order('published_at', { ascending: false })
    .limit(limit * 2);

  // Score posts based on user preferences
  const scoredPosts = (posts || []).map((post: any) => {
    let score = 0;

    // Category match bonus
    const categoryMatch = post.categories?.filter((c: string) =>
      userContext.preferred_categories.includes(c)
    ).length || 0;
    score += categoryMatch * 10;

    // Streak category bonus (encourage continuing streaks)
    const streakMatch = post.categories?.filter((c: string) =>
      streakCategories.includes(c)
    ).length || 0;
    score += streakMatch * 5;

    // Difficulty match
    if (post.difficulty === (user as any)?.difficulty_preference) {
      score += 3;
    }

    // Recency bonus (exponential decay)
    const daysSincePublished = Math.floor(
      (Date.now() - new Date(post.published_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    score += Math.max(0, 10 - daysSincePublished);

    return { ...post, score };
  });

  // Sort by score and take top N
  const recommendations = scoredPosts
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, limit);

  // Generate personalized reasons for top recommendations
  const withReasons = await Promise.all(
    recommendations.map(async (post: any) => {
      const reason = await generateRecommendationReason(
        {
          preferredCategories: userContext.preferred_categories,
          recentInteractions: userContext.recent_interactions,
          streakCategories: streakCategories,
        },
        {
          quote: post.quote_text,
          talk: post.talk_text,
          category: post.categories?.[0] || 'general',
        }
      );

      return { ...post, ai_reason: reason };
    })
  );

  return withReasons;
}

/**
 * Generate embedding for user's reflection to find similar content
 */
export async function findSimilarToReflection(
  reflectionText: string,
  excludePostIds: string[] = [],
  limit: number = 3
): Promise<any[]> {
  const supabase = createServerClient();

  // Generate embedding for the reflection
  const reflectionEmbedding = await generateEmbedding(reflectionText);

  // Get all posts with embeddings
  const { data: postsWithEmbeddings } = await supabase
    .from('post_embeddings')
    .select('post_id, embedding')
    .not('post_id', 'in', `(${excludePostIds.join(',')})`);

  if (!postsWithEmbeddings || postsWithEmbeddings.length === 0) {
    return [];
  }

  // Find similar posts using cosine similarity
  const candidates = (postsWithEmbeddings as any[]).map((p) => ({
    id: p.post_id,
    embedding: p.embedding,
  }));

  const similar = findSimilar(reflectionEmbedding, candidates, limit);

  // Fetch full post data
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .in('id', similar.map((s) => s.id));

  // Merge similarity scores with post data
  return similar.map((s) => {
    const post = posts?.find((p: any) => p.id === s.id);
    return {
      ...(post || {}),
      similarity_score: s.score,
    };
  });
}

/**
 * Simple hash function for content deduplication
 */
function hashContent(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}