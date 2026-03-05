import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db/supabase';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const supabase = createServerClient();
    
    // Get today's feed for user
    const today = new Date().toISOString().split('T')[0];
    
    const { data: feed, error } = await supabase
      .from('daily_feeds')
      .select(`
        *,
        posts:post_ids(
          *,
          quote:quote_text,
          quote_attribution,
          source_title,
          source_author,
          talk:talk_text,
          talk_tone,
          usage:usage_action,
          usage_context,
          usage_time_minutes,
          categories,
          difficulty,
          reflection_prompt
        )
      `)
      .eq('user_id', userId)
      .eq('date', today)
      .single();
    
    if (error || !feed) {
      // Generate new feed if none exists
      return generateAndReturnFeed(userId, supabase);
    }
    
    return NextResponse.json({ feed });
  } catch (error) {
    console.error('Feed error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feed' },
      { status: 500 }
    );
  }
}

async function generateAndReturnFeed(userId: string, supabase: any) {
  // Get user's preferences
  const { data: user } = await supabase
    .from('users')
    .select('preferred_categories, difficulty_preference')
    .eq('clerk_id', userId)
    .single();
  
  // Get posts matching preferences
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('is_active', true)
    .order('published_at', { ascending: false })
    .limit(5);
  
  // Create daily feed record
  const today = new Date().toISOString().split('T')[0];
  const postIds = posts?.map((p: any) => p.id) || [];
  
  const { data: feed, error } = await supabase
    .from('daily_feeds')
    .insert({
      user_id: userId,
      date: today,
      post_ids: postIds,
      completed_post_ids: [],
      streak_status: {
        overall: 0,
        atRisk: [],
        completed: []
      }
    })
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return NextResponse.json({ feed: { ...feed, posts } });
}