'use client';

import { CategoryTag } from '@/types';
import { cn } from '@/lib/utils';

interface StreakIndicatorProps {
  streak: number;
  category?: CategoryTag;
  isAtRisk?: boolean;
}

export function StreakIndicator({ streak, category, isAtRisk }: StreakIndicatorProps) {
  return (
    <div className={cn(
      "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5",
      isAtRisk ? "bg-amber-50 border border-amber-200" : "bg-neutral-100"
    )}>
      <div className="text-right">
        <p className={cn(
          "text-sm font-bold leading-none",
          isAtRisk ? "text-amber-700" : "text-neutral-900"
        )}>
          {streak}
        </p>
        {category && (
          <p className="text-[10px] text-neutral-500 uppercase tracking-wide">{category}</p>
        )}
      </div>
    </div>
  );
}