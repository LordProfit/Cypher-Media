import { auth, clerkClient } from '@clerk/nextjs/server';
import { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db/supabase';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    throw new Error('CLERK_WEBHOOK_SECRET is not set');
  }
  
  // Get headers
  const headerPayload = headers();
  const svix_id = (await headerPayload).get('svix-id');
  const svix_timestamp = (await headerPayload).get('svix-timestamp');
  const svix_signature = (await headerPayload).get('svix-signature');
  
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }
  
  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);
  
  // Verify webhook
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;
  
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  
  const eventType = evt.type;
  const supabase = createServerClient();
  
  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, username, image_url } = evt.data;
    
    const { error } = await supabase
      .from('users')
      .upsert({
        clerk_id: id,
        email: email_addresses?.[0]?.email_address,
        username: username,
        display_name: `${first_name || ''} ${last_name || ''}`.trim() || username,
        avatar_url: image_url,
      }, {
        onConflict: 'clerk_id'
      });
    
    if (error) {
      console.error('Failed to sync user from webhook:', error);
      return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
    }
  }
  
  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('clerk_id', id);
    
    if (error) {
      console.error('Failed to delete user:', error);
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
  }
  
  return NextResponse.json({ success: true });
}