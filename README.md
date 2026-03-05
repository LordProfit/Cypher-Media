# Canon Platform

Social media platform for Profit's wisdom — systems, discipline, and execution.

## Architecture

### Feed Structure

**Post Types:**
- `quote-talk-usage` — Standard post with quote, Profit's voice, and actionable usage
- `deep-dive` — Weekly longer exploration
- `micro-reflection` — Prompt-only posts
- `streak-milestone` — Progress celebrations
- `community-spotlight` — Featured user reflections

**Post Metadata:**
- Category tags (power, discipline, systems, resilience, execution, mindset, habits, leadership, friction, compliance)
- Book source (classic, modern, profit-original)
- AI difficulty (easy, medium, hard, brutal)
- Recommended daily time

**Engagement Signals:**
- Likes, saves, shares
- Reflections (user-generated content)
- Completions (mark as done)
- Streaks (category-based)

## Tech Stack

- **Frontend:** Next.js 16 + React 19 + Tailwind CSS 4
- **Backend:** Next.js API routes + Supabase/Neon PostgreSQL
- **Auth:** Clerk
- **ORM:** Drizzle
- **State:** Zustand

## Project Structure

```
canon-platform/
├── schema/
│   ├── feed-architecture.ts    # TypeScript interfaces
│   ├── post-json-schema.ts     # JSON schema for AI validation
│   ├── database.sql            # PostgreSQL schema
│   └── seed-quotes.sql         # 50 quotes (classics + Profit originals)
└── web/
    ├── app/                    # Next.js app router
    ├── components/             # React components
    ├── lib/                    # Utilities
    ├── types/                  # TypeScript types
    └── hooks/                  # Custom hooks
```

## Setup

### 1. Database

```bash
# Run schema
psql $DATABASE_URL -f schema/database.sql

# Seed data
psql $DATABASE_URL -f schema/seed-quotes.sql
```

### 2. Web App

```bash
cd web
npm install

# Environment variables
cp .env.example .env.local
# Add: DATABASE_URL, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY

npm run dev
```

## AI Prompts

### Generate Post

```
Create a CanonPost following the schema in schema/post-json-schema.ts.

Quote: [text]
Attribution: [name]
Source: [book]

Generate:
- talk (Profit's voice — direct, brutal, no fluff)
- usage (specific micro-action)
- category tags
- difficulty level
- reflection prompt
```

### Feed Recommendation

```
Given user preferences and streak data, recommend the next post.

Input: {userId, preferredCategories, streaks, completedPosts}
Output: {postId, reason}

Prioritize:
1. Streak gaps (categories at risk)
2. User preferences
3. New content
4. Difficulty match
```

## Features

- [x] Feed architecture schema
- [x] Database schema with 50 seed quotes
- [x] Next.js scaffold with components
- [ ] Clerk auth integration
- [ ] Supabase connection
- [ ] Feed recommendation engine
- [ ] Reflection tracking
- [ ] Streak system

## License

Private — Arturious Castillo