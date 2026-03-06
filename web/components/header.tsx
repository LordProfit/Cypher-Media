import Link from 'next/link';
import { Flame, User } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white">
            <Flame className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-neutral-900">Canon</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-2">
          <button className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors">
            <User className="h-5 w-5" />
          </button>
        </nav>
      </div>
    </header>
  );
}