'use client';

import { useState } from 'react';
import { useFeed, useInteract, useStreaks } from '@/hooks/use-feed';
import { CategoryTag, InteractionType } from '@/types';
import { PostCard } from './post-card';
import { CategoryFilter } from './category-filter';
import { StreakIndicator } from './streak-indicator';
import { Loader2, Flame } from 'lucide-react';

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
  const { data: feed, isLoading, error } = useFeed();
  const { data: streaks } = useStreaks();
  const interact = useInteract();

  const toggleCategory = (category: CategoryTag) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleInteract = (postId: string, type: InteractionType) => {
    interact.mutate({ postId, type });
  };

  // Filter posts by selected categories
  const posts = feed?.posts || [];
  const filteredPosts =
    selectedCategories.length === 0
      ? posts
      : posts.filter((post) =>
          post.category.some((c) => selectedCategories.includes(c))
        );

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-300" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        Failed to load feed. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Streak Status */}
      <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
            <Flame className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Current Streak</p>
            <p className="text-2xl font-bold text-neutral-900">
              {streaks?.overall?.current || 0}
              <span className="text-sm font-normal text-neutral-500 ml-1">days</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {streaks?.categories?.slice(0, 3).map((streak: any) => (
            <StreakIndicator
              key={streak.category}
              streak={streak.current_streak}
              category={streak.category}
            />
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <CategoryFilter
        categories={ALL_CATEGORIES}
        selected={selectedCategories}
        onToggle={toggleCategory}
      />

      {/* Posts */}
      <div className="space-y-3">
        {filteredPosts.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
            No posts found for selected categories.
          </div>
        ) : (
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isCompleted={feed?.streakStatus?.completed?.includes(
                post.category[0]
              )}
              onInteract={(type) => handleInteract(post.id, type)}
            />
          ))
        )}
      </div>
    </div>
  );
}