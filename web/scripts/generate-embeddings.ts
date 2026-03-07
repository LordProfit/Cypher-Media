/**
 * Script to generate embeddings for all posts
 * Run: npx tsx scripts/generate-embeddings.ts
 */

import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from '../lib/ai/embeddings';
import { Database } from '../lib/db/database.types';

// Load env vars manually for CLI script
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://znzgsdtspfmucxtvgcjc.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY is required');
  console.error('Set it in your environment or .env.local file');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function embedPost(postId: string): Promise<void> {
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

  // Store in database
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
    throw error;
  }
}

function hashContent(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

async function main() {
  console.log('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Not set');
  console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Set' : 'Not set');
  
  console.log('Fetching all posts...');
  
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id')
    .eq('is_active', true);
  
  if (error) {
    console.error('Failed to fetch posts:', error);
    process.exit(1);
  }
  
  console.log(`Found ${posts?.length || 0} posts to process`);
  
  let success = 0;
  let failed = 0;
  
  for (const post of posts || []) {
    try {
      await embedPost((post as any).id);
      success++;
      process.stdout.write('.');
    } catch (err) {
      failed++;
      process.stdout.write('x');
      console.error('\nError:', err);
    }
    
    // Rate limit for Gemini API
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n\nDone! Success: ${success}, Failed: ${failed}`);
  process.exit(0);
}

main();