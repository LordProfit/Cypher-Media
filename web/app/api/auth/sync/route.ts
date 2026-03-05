import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { syncUserToDatabase } from '@/lib/auth/sync-user';

export async function POST() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await syncUserToDatabase(userId);
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync user' },
      { status: 500 }
    );
  }
}