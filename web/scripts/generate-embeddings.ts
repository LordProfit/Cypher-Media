/**
 * Script to generate embeddings for all posts
 * Run: npx tsx scripts/generate-embeddings.ts
 */

import { createServerClient } from '../lib/db/supabase';
import { embedPost } from '../lib/ai/recommendations';

async function main() {
  const supabase = createServerClient();
  
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
    }
    
    // Rate limit: 20 requests per second for text-embedding-3-small
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  console.log(`\n\nDone! Success: ${success}, Failed: ${failed}`);
  process.exit(0);
}

main();