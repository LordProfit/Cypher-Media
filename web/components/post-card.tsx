'use client';

import { useState } from 'react';
import { CanonPost, InteractionType } from '@/types';
import { cn, formatNumber, getCategoryColor, getDifficultyLabel, getDifficultyColor } from '@/lib/utils';
import { Heart, Bookmark, Share2, MessageSquare, CheckCircle, Clock, Quote } from 'lucide-react';

interface PostCardProps {
  post: CanonPost;
  isCompleted?: boolean;
  onInteract?: (type: InteractionType) => void;
}

export function PostCard({ post, isCompleted, onInteract }: PostCardProps) {
  const [showReflection, setShowReflection] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [hasReflected, setHasReflected] = useState(false);

  const handleReflect = () => {
    if (reflectionText.trim()) {
      onInteract?.('reflect');
      setHasReflected(true);
      setShowReflection(false);
    }
  };

  return (
    <article className={cn(
      "rounded-lg border bg-white overflow-hidden transition-all",
      isCompleted ? "border-green-200 bg-green-50/30" : "border-neutral-200 hover:border-neutral-300"
    )}>
      {/* Header: Categories & Difficulty */}
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {post.category.map((cat) => (
            <span
              key={cat}
              className={cn(
                "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium uppercase tracking-wide",
                getCategoryColor(cat)
              )}
            >
              {cat}
            </span>
          ))}
        </div>
        <span className={cn(
          "rounded px-2 py-0.5 text-xs font-medium",
          getDifficultyColor(post.difficulty)
        )}>
          {getDifficultyLabel(post.difficulty)}
        </span>
      </div>

      {/* Quote Section */}
      <div className="px-4 py-6">
        <div className="relative">
          <Quote className="absolute -left-1 -top-2 h-8 w-8 text-neutral-200" />
          <blockquote className="relative pl-8">
            <p className="text-xl font-serif leading-relaxed text-neutral-900">
              {post.quote.text}
            </p>
            <footer className="mt-3 text-sm text-neutral-500">
              — {post.quote.attribution}
              {post.quote.source.type === 'profit-original' && (
                <span className="ml-2 text-xs text-red-600 font-medium">Profit Original</span>
              )}
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Talk Section (Profit's Voice) */}
      <div className="border-t border-neutral-100 bg-neutral-50/50 px-4 py-4">
        <p className={cn(
          "text-sm leading-relaxed",
          post.talk.tone === 'brutal' && "text-neutral-800 font-medium",
          post.talk.tone === 'direct' && "text-neutral-700",
          post.talk.tone === 'provoking' && "text-neutral-800 italic",
          post.talk.tone === 'empathetic' && "text-neutral-600"
        )}>
          {post.talk.text}
        </p>
      </div>

      {/* Usage Section (Actionable) */}
      <div className="border-t border-neutral-100 px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white">
            <Clock className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-neutral-900">Today's Action</h4>
            <p className="mt-1 text-sm text-neutral-700">{post.usage.action}</p>
            <p className="mt-1 text-xs text-neutral-500">{post.usage.context}</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-neutral-400">
              <Clock className="h-3 w-3" />
              <span>{post.usage.timeMinutes} min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reflection Prompt */}
      {post.reflectionPrompt && (
        <div className="border-t border-neutral-100 bg-amber-50/30 px-4 py-3">
          <p className="text-sm text-amber-800">
            <span className="font-medium">Reflect: </span>
            {post.reflectionPrompt}
          </p>
        </div>
      )}

      {/* Reflection Input */}
      {showReflection && (
        <div className="border-t border-neutral-100 px-4 py-3">
          <textarea
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder="Write your reflection..."
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            rows={3}
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={() => setShowReflection(false)}
              className="rounded px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900"
            >
              Cancel
            </button>
            <button
              onClick={handleReflect}
              className="rounded bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
            >
              Save Reflection
            </button>
          </div>
        </div>
      )}

      {/* Engagement Bar */}
      <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onInteract?.('like')}
            className="flex items-center gap-1.5 text-neutral-500 hover:text-red-600 transition-colors"
          >
            <Heart className="h-4 w-4" />
            <span className="text-xs font-medium">{formatNumber(post.engagement.likes)}</span>
          </button>
          <button
            onClick={() => onInteract?.('save')}
            className="flex items-center gap-1.5 text-neutral-500 hover:text-blue-600 transition-colors"
          >
            <Bookmark className="h-4 w-4" />
            <span className="text-xs font-medium">{formatNumber(post.engagement.saves)}</span>
          </button>
          <button
            onClick={() => setShowReflection(!showReflection)}
            className={cn(
              "flex items-center gap-1.5 transition-colors",
              hasReflected ? "text-green-600" : "text-neutral-500 hover:text-green-600"
            )}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="text-xs font-medium">
              {hasReflected ? 'Reflected' : formatNumber(post.engagement.reflections)}
            </span>
          </button>
          <button
            onClick={() => onInteract?.('share')}
            className="flex items-center gap-1.5 text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        {/* Complete Button */}
        <button
          onClick={() => onInteract?.('complete')}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
            isCompleted
              ? "bg-green-100 text-green-700"
              : "bg-neutral-900 text-white hover:bg-neutral-800"
          )}
        >
          <CheckCircle className="h-3.5 w-3.5" />
          {isCompleted ? 'Completed' : 'Mark Done'}
        </button>
      </div>

      {/* Completion Stats */}
      {post.engagement.completions > 0 && (
        <div className="border-t border-neutral-100 bg-neutral-50/50 px-4 py-2">
          <p className="text-xs text-neutral-500">
            {formatNumber(post.engagement.completions)} people completed this today
          </p>
        </div>
      )}
    </article>
  );
}