'use client';

import { useState } from 'react';
import { CanonPost, CategoryTag, InteractionType } from '@/types';
import { PostCard } from './post-card';
import { CategoryFilter } from './category-filter';
import { StreakIndicator } from './streak-indicator';

// Mock data for development
const MOCK_POSTS: CanonPost[] = [
  {
    id: '1',
    slug: 'motivation-system-failure',
    quote: {
      text: "The strongest systems don't need consent. They make compliance the only logical path.",
      attribution: 'Profit',
      source: {
        title: 'Canon: Systems Over Willpower',
        author: 'Arturious Castillo',
        type: 'profit-original',
      },
    },
    talk: {
      text: "You don't need more discipline. You need a system that makes the wrong choice harder than the right one. Motivation is a feeling. Systems are architecture.",
      tone: 'brutal',
    },
    usage: {
      action: 'Identify one habit you struggle with. Add 20 seconds of friction to the wrong choice.',
      context: 'Morning routine, phone usage, diet — wherever you break promises to yourself.',
      timeMinutes: 5,
    },
    type: 'quote-talk-usage',
    category: ['systems', 'habits', 'discipline'],
    difficulty: 'easy',
    engagement: {
      likes: 1247,
      saves: 892,
      shares: 334,
      reflections: 156,
      completions: 2089,
    },
    reflectionPrompt: 'What system failed you today? Not your willpower — the system.',
    createdAt: '2026-03-05T00:00:00Z',
    updatedAt: '2026-03-05T00:00:00Z',
    publishedAt: '2026-03-05T00:00:00Z',
    isActive: true,
  },
  {
    id: '2',
    slug: 'discipline-myth',
    quote: {
      text: 'Discipline is a myth. What you call discipline, I call a system with no exit.',
      attribution: 'Profit',
      source: {
        title: 'Canon: Systems Over Willpower',
        author: 'Arturious Castillo',
        type: 'profit-original',
      },
    },
    talk: {
      text: "You don't need more willpower. You need fewer choices. The most disciplined people don't resist temptation — they engineer it out of existence.",
      tone: 'brutal',
    },
    usage: {
      action: 'Remove one temptation from your environment today.',
      context: 'Your phone, junk food, distractions — make the wrong choice physically harder.',
      timeMinutes: 10,
    },
    type: 'quote-talk-usage',
    category: ['discipline', 'systems', 'habits'],
    difficulty: 'easy',
    engagement: {
      likes: 892,
      saves: 1203,
      shares: 445,
      reflections: 234,
      completions: 1567,
    },
    reflectionPrompt: 'What are you still trying to white-knuckle through?',
    createdAt: '2026-03-04T00:00:00Z',
    updatedAt: '2026-03-04T00:00:00Z',
    publishedAt: '2026-03-04T00:00:00Z',
    isActive: true,
  },
];

const ALL_CATEGORIES: CategoryTag[] = [
  'power',
  'discipline',
  'systems',
  'resilience',
  'execution',
  'mindset',
  'habits',
  'leadership',
  'friction',
  'compliance',
];

export function Feed() {
  const [selectedCategories, setSelectedCategories] = useState<CategoryTag[]>([]);
  const [completedPosts, setCompletedPosts] = useState<Set<string>>(new Set());

  const toggleCategory = (category: CategoryTag) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleInteract = (postId: string, type: InteractionType) => {
    if (type === 'complete') {
      setCompletedPosts((prev) => new Set([...prev, postId]));
    }
    console.log(`Post ${postId}: ${type}`);
  };

  const filteredPosts =
    selectedCategories.length === 0
      ? MOCK_POSTS
      : MOCK_POSTS.filter((post) =>
          post.category.some((c) => selectedCategories.includes(c))
        );

  return (
    <div className="space-y-6">
      {/* Streak Status */}
      <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4">
        <div>
          <h2 className="text-sm font-medium text-neutral-500">Current Streak</h2>
          <p className="text-2xl font-bold text-neutral-900">12 days</p>
        </div>
        <StreakIndicator streak={12} />
      </div>

      {/* Category Filter */}
      <CategoryFilter
        categories={ALL_CATEGORIES}
        selected={selectedCategories}
        onToggle={toggleCategory}
      />

      {/* Posts */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isCompleted={completedPosts.has(post.id)}
            onInteract={(type) => handleInteract(post.id, type)}
          />
        ))}
      </div>
    </div>
  );
}