// ============================================================================
// Utility Functions
// ============================================================================

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format relative time (e.g., "2 days ago")
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Format number with k/m suffix
export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
  return num.toString();
}

// Get category color
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    power: 'bg-red-600 text-white',
    discipline: 'bg-amber-500 text-black',
    systems: 'bg-blue-600 text-white',
    resilience: 'bg-emerald-600 text-white',
    execution: 'bg-purple-600 text-white',
    mindset: 'bg-indigo-600 text-white',
    habits: 'bg-teal-600 text-white',
    leadership: 'bg-orange-600 text-white',
    friction: 'bg-rose-600 text-white',
    compliance: 'bg-slate-700 text-white',
  };
  return colors[category] || 'bg-gray-600 text-white';
}

// Get difficulty label
export function getDifficultyLabel(difficulty: string): string {
  const labels: Record<string, string> = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    brutal: 'Brutal',
  };
  return labels[difficulty] || difficulty;
}

// Get difficulty color
export function getDifficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    easy: 'text-green-600 bg-green-50',
    medium: 'text-yellow-600 bg-yellow-50',
    hard: 'text-orange-600 bg-orange-50',
    brutal: 'text-red-600 bg-red-50',
  };
  return colors[difficulty] || 'text-gray-600 bg-gray-50';
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

// Generate slug from text
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 50);
}