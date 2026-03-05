'use client';

import { useState } from 'react';
import { useFeed, useInteract, useStreaks } from '@/hooks/use-feed';
import { CategoryTag, InteractionType } from '@/types';
import { PostCard } from './post-card';
import { CategoryFilter } from './category-filter';
import { StreakIndicator } from './streak-indicator';
import { Flame, Loader2 } from 'lucide-react';

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
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        Failed to load feed. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Streak Status */}
      <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4">
        <div>
          <h2 className="text-sm font-medium text-neutral-500">Current Streak</h2>
          <p className="text-2xl font-bold text-neutral-900">
            {streaks?.overall?.current || 0} days
          </p>
        </div>
        <div className="flex items-center gap-4">
          {streaks?.categories?.slice(0, 3).map((streak: any) => (
            <StreakIndicator
              key={streak.category}
              streak={streak.current_streak}
              category={streak.category}
              isAtRisk={
                streak.last_completed_at &&
                new Date(streak.last_completed_at).toDateString() !==
                  new Date().toDateString()
              }
            />
          ))}
        </div>
      </div>

      {/* Daily Prompt */}
      {feed?.dailyPrompt && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <Flame className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-900">Daily Reflection</p>
              <p className="text-sm text-amber-800">{feed.dailyPrompt.prompt}</p>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <CategoryFilter
        categories={ALL_CATEGORIES}
        selected={selectedCategories}
        onToggle={toggleCategory}
      />

      {/* Posts */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-neutral-500">
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