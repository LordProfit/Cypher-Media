import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db/supabase';
import { InteractionType } from '@/types';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { postId, type, reflectionText } = body;
    
    if (!postId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const supabase = createServerClient();
    
    // Get user's database ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Record interaction
    const { error: interactionError } = await supabase
      .from('interactions')
      .upsert({
        user_id: user.id,
        post_id: postId,
        type: type as InteractionType,
        reflection_text: reflectionText,
      }, {
        onConflict: 'user_id,post_id,type'
      });
    
    if (interactionError) {
      throw interactionError;
    }
    
    // Update engagement counts on post
    const columnMap: Record<InteractionType, string> = {
      like: 'likes_count',
      save: 'saves_count',
      share: 'shares_count',
      reflect: 'reflections_count',
      complete: 'completions_count',
    };
    
    const { error: updateError } = await supabase.rpc('increment_engagement', {
      post_id: postId,
      column_name: columnMap[type as InteractionType]
    });
    
    if (updateError) {
      // Fallback: direct update
      await supabase
        .from('posts')
        .update({
          [columnMap[type as InteractionType]]: supabase.rpc('increment', { x: 1 })
        })
        .eq('id', postId);
    }
    
    // If completed, update streaks
    if (type === 'complete') {
      await updateStreaks(user.id, postId, supabase);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Interaction error:', error);
    return NextResponse.json(
      { error: 'Failed to record interaction' },
      { status: 500 }
    );
  }
}

async function updateStreaks(userId: string, postId: string, supabase: any) {
  // Get post categories
  const { data: post } = await supabase
    .from('posts')
    .select('categories')
    .eq('id', postId)
    .single();
  
  if (!post) return;
  
  // Update category streaks
  for (const category of post.categories) {
    const { data: streak } = await supabase
      .from('category_streaks')
      .select('*')
      .eq('user_id', userId)
      .eq('category', category)
      .single();
    
    if (streak) {
      // Check if already completed today
      const lastCompleted = new Date(streak.last_completed_at);
      const today = new Date();
      const isSameDay = lastCompleted.toDateString() === today.toDateString();
      
      if (!isSameDay) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const isConsecutive = lastCompleted.toDateString() === yesterday.toDateString();
        
        const newStreak = isConsecutive ? streak.current_streak + 1 : 1;
        
        await supabase
          .from('category_streaks')
          .update({
            current_streak: newStreak,
            longest_streak: Math.max(newStreak, streak.longest_streak),
            last_completed_at: new Date().toISOString()
          })
          .eq('id', streak.id);
      }
    } else {
      // Create new streak
      await supabase
        .from('category_streaks')
        .insert({
          user_id: userId,
          category: category,
          current_streak: 1,
          longest_streak: 1,
          last_completed_at: new Date().toISOString()
        });
    }
  }
  
  // Update user's overall streak
  const { data: user } = await supabase
    .from('users')
    .select('current_streak, longest_streak, last_activity_at')
    .eq('id', userId)
    .single();
  
  if (user) {
    const lastActivity = user.last_activity_at ? new Date(user.last_activity_at) : null;
    const today = new Date();
    const isSameDay = lastActivity?.toDateString() === today.toDateString();
    
    if (!isSameDay) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const isConsecutive = lastActivity?.toDateString() === yesterday.toDateString();
      
      const newStreak = isConsecutive ? user.current_streak + 1 : 1;
      
      await supabase
        .from('users')
        .update({
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, user.longest_streak),
          last_activity_at: new Date().toISOString(),
          total_completions: supabase.rpc('increment', { x: 1 })
        })
        .eq('id', userId);
    }
  }
}