'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CanonPost, InteractionType, FeedResponse } from '@/types';

// Fetch daily feed
export function useFeed() {
  return useQuery<FeedResponse>({
    queryKey: ['feed'],
    queryFn: async () => {
      const res = await fetch('/api/feed');
      if (!res.ok) throw new Error('Failed to fetch feed');
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch single post
export function usePost(slug: string) {
  return useQuery<CanonPost>({
    queryKey: ['post', slug],
    queryFn: async () => {
      const res = await fetch(`/api/posts/${slug}`);
      if (!res.ok) throw new Error('Failed to fetch post');
      return res.json();
    },
    enabled: !!slug,
  });
}

// Record interaction (like, save, complete, reflect)
export function useInteract() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      postId,
      type,
      reflectionText,
    }: {
      postId: string;
      type: InteractionType;
      reflectionText?: string;
    }) => {
      const res = await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, type, reflectionText }),
      });
      if (!res.ok) throw new Error('Failed to record interaction');
      return res.json();
    },
    onSuccess: () => {
      // Invalidate feed to refresh data
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['streaks'] });
    },
  });
}

// Fetch user streaks
export function useStreaks() {
  return useQuery({
    queryKey: ['streaks'],
    queryFn: async () => {
      const res = await fetch('/api/streaks');
      if (!res.ok) throw new Error('Failed to fetch streaks');
      return res.json();
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

// Fetch user's reflections
export function useReflections() {
  return useQuery({
    queryKey: ['reflections'],
    queryFn: async () => {
      const res = await fetch('/api/reflections');
      if (!res.ok) throw new Error('Failed to fetch reflections');
      return res.json();
    },
  });
}

// Submit reflection
export function useSubmitReflection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      postId,
      text,
      isPublic,
    }: {
      postId: string;
      text: string;
      isPublic?: boolean;
    }) => {
      const res = await fetch('/api/reflections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, text, isPublic }),
      });
      if (!res.ok) throw new Error('Failed to submit reflection');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reflections'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}