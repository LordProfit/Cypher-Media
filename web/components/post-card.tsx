'use client';

import { useState } from 'react';
import { CanonPost, InteractionType } from '@/types';
import { cn, formatNumber, getCategoryColor } from '@/lib/utils';
import { Heart, Bookmark, Share2, MessageSquare, CheckCircle2 } from 'lucide-react';

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
      "rounded-xl border bg-white overflow-hidden",
      isCompleted ? "border-green-200" : "border-neutral-200"
    )}>
      {/* Header: Categories */}
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
        <div className="flex flex-wrap gap-1.5">
          {post.category.slice(0, 2).map((cat) => (
            <span
              key={cat}
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                getCategoryColor(cat)
              )}
            >
              {cat}
            </span>
          ))}
        </div>
        
        {isCompleted && (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        )}
      </div>

      {/* Quote Section */}
      <div className="px-4 py-4">
        <blockquote>
          <p className="text-base font-medium leading-snug text-neutral-900">
            "{post.quote.text}"
          </p>
          <footer className="mt-2 text-xs text-neutral-500">
            — {post.quote.attribution}
            {post.quote.source.type === 'profit-original' && (
              <span className="ml-1.5 text-[10px] font-medium text-red-600">PROFIT</span>
            )}
          </footer>
        </blockquote>
      </div>

      {/* Talk Section */}
      <div className="border-t border-neutral-100 bg-neutral-50/50 px-4 py-3">
        <p className="text-sm leading-relaxed text-neutral-700">
          {post.talk.text}
        </p>
      </div>

      {/* Usage Section */}
      <div className="border-t border-neutral-100 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white text-[10px] font-bold">
            {post.usage.timeMinutes}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-900">{post.usage.action}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{post.usage.context}</p>
          </div>
        </div>
      </div>

      {/* Reflection Prompt */}
      {post.reflectionPrompt && (
        <div className="border-t border-neutral-100 bg-amber-50/30 px-4 py-2.5">
          <p className="text-xs text-amber-800">
            <span className="font-semibold">Reflect: </span>
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
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            rows={2}
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={() => setShowReflection(false)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900"
            >
              Cancel
            </button>
            <button
              onClick={handleReflect}
              className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Engagement Bar */}
      <div className="flex items-center justify-between border-t border-neutral-100 px-3 py-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onInteract?.('like')}
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-red-500 transition-colors"
          >
            <Heart className="h-4 w-4" />
            <span className="text-xs font-medium">{formatNumber(post.engagement.likes)}</span>
          </button>
          
          <button
            onClick={() => onInteract?.('save')}
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-blue-500 transition-colors"
          >
            <Bookmark className="h-4 w-4" />
            <span className="text-xs font-medium">{formatNumber(post.engagement.saves)}</span>
          </button>
          
          <button
            onClick={() => setShowReflection(!showReflection)}
            className={cn(
              "flex items-center gap-1 rounded-lg px-2 py-1.5 transition-colors",
              hasReflected 
                ? "text-green-600 bg-green-50" 
                : "text-neutral-500 hover:bg-neutral-100 hover:text-green-600"
            )}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="text-xs font-medium">
              {hasReflected ? 'Done' : formatNumber(post.engagement.reflections)}
            </span>
          </button>
          
          <button
            onClick={() => onInteract?.('share')}
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-neutral-500 hover:bg-neutral-100 transition-colors"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        {/* Complete Button */}
        <button
          onClick={() => onInteract?.('complete')}
          className={cn(
            "flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
            isCompleted
              ? "bg-green-100 text-green-700"
              : "bg-neutral-900 text-white hover:bg-neutral-800"
          )}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          {isCompleted ? 'Done' : 'Complete'}
        </button>
      </div>
    </article>
  );
}