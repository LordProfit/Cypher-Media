import OpenAI from 'openai';

let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export interface EmbeddingResult {
  embedding: number[];
  text: string;
}

/**
 * Generate embeddings for text using OpenAI's text-embedding-3-small model
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await getOpenAI().embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    dimensions: 1536,
  });

  return response.data[0].embedding;
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
  const response = await getOpenAI().embeddings.create({
    model: 'text-embedding-3-small',
    input: texts,
    dimensions: 1536,
  });

  return response.data.map((item, index) => ({
    embedding: item.embedding,
    text: texts[index],
  }));
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Find most similar items given a query embedding and candidate embeddings
 */
export function findSimilar(
  queryEmbedding: number[],
  candidates: { id: string; embedding: number[]; metadata?: any }[],
  topK: number = 5
): { id: string; score: number; metadata?: any }[] {
  const similarities = candidates.map((candidate) => ({
    id: candidate.id,
    score: cosineSimilarity(queryEmbedding, candidate.embedding),
    metadata: candidate.metadata,
  }));

  return similarities
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Generate a personalized recommendation reason using GPT
 */
export async function generateRecommendationReason(
  userContext: {
    preferredCategories: string[];
    recentInteractions: string[];
    streakCategories: string[];
  },
  post: {
    quote: string;
    talk: string;
    category: string;
  }
): Promise<string> {
  const prompt = `You are Canon, a wisdom platform that delivers actionable insights without motivational fluff.

User Context:
- Preferred categories: ${userContext.preferredCategories.join(', ')}
- Recent topics engaged with: ${userContext.recentInteractions.join(', ') || 'None yet'}
- Current streaks in: ${userContext.streakCategories.join(', ') || 'None yet'}

Content to recommend:
- Category: ${post.category}
- Quote: "${post.quote}"
- Talk excerpt: "${post.talk.substring(0, 200)}..."

Generate a ONE SENTENCE personalized reason why this content matters for this user right now. Be direct, slightly provocative, and systems-focused. No emojis. No "This will inspire you" fluff.

Example good reasons:
- "You've been avoiding the hard conversations—this is your framework."
- "Your execution streak is strong but your systems thinking is weak."
- "This bridges your discipline practice with real-world power dynamics."`;

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 100,
  });

  return response.choices[0].message.content?.trim() || 'Recommended based on your focus areas.';
}