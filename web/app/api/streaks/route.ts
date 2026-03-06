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
    
    // Get user's database ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const userIdFromDb = (user as any).id;
    
    // Get user's streaks
    const { data: streaks } = await supabase
      .from('category_streaks')
      .select('*')
      .eq('user_id', userIdFromDb);
    
    // Get user's overall stats
    const { data: userStats } = await supabase
      .from('users')
      .select('current_streak, longest_streak, total_completions, total_reflections')
      .eq('id', userIdFromDb)
      .single();
    
    return NextResponse.json({
      overall: {
        current: (userStats as any)?.current_streak || 0,
        longest: (userStats as any)?.longest_streak || 0,
      },
      categories: streaks || [],
      stats: {
        totalCompletions: (userStats as any)?.total_completions || 0,
        totalReflections: (userStats as any)?.total_reflections || 0,
      }
    });
  } catch (error) {
    console.error('Streaks error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch streaks' },
      { status: 500 }
    );
  }
}