import { clerkClient } from '@clerk/nextjs/server';
import { createServerClient } from './supabase';

export async function syncUserToDatabase(clerkUserId: string) {
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(clerkUserId);
  
  const supabase = createServerClient();
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      clerk_id: clerkUserId,
      email: user.emailAddresses[0]?.emailAddress,
      username: user.username,
      display_name: `${user.firstName} ${user.lastName}`.trim() || user.username,
      avatar_url: user.imageUrl,
      preferred_categories: [],
      daily_time_goal: 10,
      difficulty_preference: 'medium',
      current_streak: 0,
      longest_streak: 0,
      total_reflections: 0,
      total_completions: 0,
    }, {
      onConflict: 'clerk_id'
    })
    .select()
    .single();
  
  if (error) {
    console.error('Failed to sync user:', error);
    throw error;
  }
  
  return data;
}