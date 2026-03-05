'use client';

import { CategoryTag } from '@/types';
import { cn } from '@/lib/utils';
import { Flame, AlertCircle } from 'lucide-react';

interface StreakIndicatorProps {
  streak: number;
  category?: CategoryTag;
  isAtRisk?: boolean;
}

export function StreakIndicator({ streak, category, isAtRisk }: StreakIndicatorProps) {
  return (
    <div className={cn(
      "flex items-center gap-2 rounded-lg px-3 py-2",
      isAtRisk ? "bg-amber-50 border border-amber-200" : "bg-neutral-100"
    )}>
      {isAtRisk ? (
        <AlertCircle className="h-5 w-5 text-amber-600" />
      ) : (
        <Flame className={cn(
          "h-5 w-5",
          streak > 10 ? "text-orange-500" : "text-neutral-500"
        )} />
      )}
      <div className="text-right">
        <p className={cn(
          "text-lg font-bold leading-none",
          isAtRisk ? "text-amber-700" : "text-neutral-900"
        )}>
          {streak}
        </p>
        {category && (
          <p className="text-xs text-neutral-500 capitalize">{category}</p>
        )}
        {isAtRisk && (
          <p className="text-xs text-amber-600">At risk</p>
        )}
      </div>
    </div>
  );
}