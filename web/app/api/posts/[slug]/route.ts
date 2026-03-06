import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db/supabase';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { userId } = await auth();
    const { slug } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const supabase = createServerClient();
    
    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
    
    if (error || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    // Check if user has interacted with this post
    const { data: interactions } = await supabase
      .from('interactions')
      .select('type')
      .eq('post_id', (post as any).id)
      .eq('user_id', userId);
    
    return NextResponse.json({
      ...(post as any),
      userInteractions: interactions?.map((i: any) => i.type) || [],
    });
  } catch (error) {
    console.error('Post fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}