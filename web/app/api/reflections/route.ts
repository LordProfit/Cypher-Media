import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db/supabase';

// GET /api/reflections - Get user's reflections
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
    
    const { data: reflections, error } = await supabase
      .from('reflections')
      .select(`
        *,
        post:post_id(
          quote_text,
          quote_attribution,
          categories
        )
      `)
      .eq('user_id', (user as any).id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return NextResponse.json({ reflections });
  } catch (error) {
    console.error('Reflections fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reflections' },
      { status: 500 }
    );
  }
}

// POST /api/reflections - Create new reflection
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { postId, text, isPublic = false } = body;
    
    if (!postId || !text) {
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
    
    // Create reflection
    const { data: reflection, error } = await supabase
      .from('reflections')
      .insert({
        user_id: (user as any).id,
        post_id: postId,
        text,
        is_public: isPublic,
      } as any)
      .select()
      .single();
    
    if (error) throw error;
    
    // Update user's reflection count - skip for now due to type issues
    // await supabase
    //   .from('users')
    //   .update({
    //     total_reflections: supabase.rpc('increment', { x: 1 }),
    //   })
    //   .eq('id', (user as any).id);
    
    // Record interaction
    await supabase
      .from('interactions')
      .upsert({
        user_id: (user as any).id,
        post_id: postId,
        type: 'reflect',
      } as any, {
        onConflict: 'user_id,post_id,type',
      });
    
    return NextResponse.json({ reflection });
  } catch (error) {
    console.error('Reflection creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create reflection' },
      { status: 500 }
    );
  }
}