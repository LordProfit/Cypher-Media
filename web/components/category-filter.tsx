'use client';

import { CategoryTag } from '@/types';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  categories: CategoryTag[];
  selected: CategoryTag[];
  onToggle: (category: CategoryTag) => void;
}

export function CategoryFilter({ categories, selected, onToggle }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 py-2">
      {categories.map((category) => {
        const isSelected = selected.includes(category);
        return (
          <button
            key={category}
            onClick={() => onToggle(category)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-all",
              isSelected
                ? "bg-neutral-900 text-white shadow-sm"
                : "bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
            )}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}