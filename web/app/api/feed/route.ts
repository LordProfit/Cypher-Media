
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db/supabase';

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const supabase = createServerClient();

    // Get Supabase user ID from Clerk ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, preferred_categories, difficulty_preference')
      .eq('clerk_id', clerkId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = (user as any).id;
    const today = new Date().toISOString().split('T')[0];

    // Check for existing feed
    const { data: existingFeed } = await supabase
      .from('daily_feeds')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (existingFeed) {
      // Fetch the actual posts
      const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .in('id', (existingFeed as any).post_ids || [])
        .eq('is_active', true);

      return NextResponse.json({ feed: { ...(existingFeed as any), posts } });
    }

    // Generate new feed
    const { data: posts } = await supabase
      .from('posts')
      .select('*')
      .eq('is_active', true)
      .order('published_at', { ascending: false })
      .limit(5);

    const postIds = posts?.map((p: any) => p.id) || [];

    const { data: feed, error: feedError } = await supabase
      .from('daily_feeds')
      .insert({
        user_id: userId,
        date: today,
        post_ids: postIds,
        completed_post_ids: [],
        streak_status: { overall: 0, atRisk: [], completed: [] }
      } as any)
      .select()
      .single();

    if (feedError) throw feedError;

    return NextResponse.json({ feed: { ...(feed as any), posts } });

  } catch (error) {
    console.error('Feed error:', error);
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
  }
}