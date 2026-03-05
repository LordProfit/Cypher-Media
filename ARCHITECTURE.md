# Canon Platform - Complete Architecture

## 1. SYSTEM OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CANON PLATFORM                                  │
│                    "Social feed for actionable wisdom"                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   CLIENT     │────▶│   EDGE/CDN   │────▶│   SERVER     │────▶│   DATABASE   │
│  (Next.js)   │     │   (Vercel)   │     │  (API/AI)    │     │  (Supabase)  │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
       │                                              │                │
       │         ┌──────────────┐                     │                │
       └────────▶│  Real-time   │◀────────────────────┘                │
                 │   (WebSocket)│                                      │
                 └──────────────┘                                      │
                                                                        │
                              ┌──────────────┐     ┌──────────────┐    │
                              │  Vector DB   │◀────│  AI/ML       │◀───┘
                              │  (Pinecone)  │     │  (OpenAI)    │
                              └──────────────┘     └──────────────┘
```

## 2. DATA MODEL

### Core Entities

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     USERS       │       │     POSTS       │       │  INTERACTIONS   │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ clerk_id        │◀──────│ quote_text      │◀──────│ user_id (FK)    │
│ email           │       │ quote_attribution│      │ post_id (FK)    │
│ username        │       │ source_title    │       │ type            │
│ avatar_url      │       │ source_author   │       │ reflection_text │
│ preferences     │       │ talk_text       │       │ timestamp       │
│ streaks         │       │ talk_tone       │       └─────────────────┘
│ created_at      │       │ usage_action    │
└─────────────────┘       │ usage_context   │       ┌─────────────────┐
                          │ usage_time_min  │       │   REFLECTIONS   │
┌─────────────────┐       │ category[]      │       ├─────────────────┤
│ CATEGORY_STREAKS│       │ difficulty      │       │ id (PK)         │
├─────────────────┤       │ engagement      │       │ user_id (FK)    │
│ id (PK)         │       │ reflection_prompt│      │ post_id (FK)    │
│ user_id (FK)    │       │ created_at      │       │ text            │
│ category        │       │ published_at    │       │ is_public       │
│ current_streak  │       │ is_active       │       │ featured_at     │
│ longest_streak  │       └─────────────────┘       │ likes           │
│ last_completed  │                                 │ created_at      │
└─────────────────┘                                 └─────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   DAILY_FEEDS   │       │  NOTIFICATIONS  │       │  EMBEDDINGS     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ user_id (FK)    │       │ user_id (FK)    │       │ post_id (FK)    │
│ date            │       │ type            │       │ vector[1536]    │
│ post_ids[]      │       │ title           │       │ metadata        │
│ completed_ids[] │       │ body            │       │ created_at      │
│ streak_status   │       │ data            │       └─────────────────┘
│ created_at      │       │ read_at         │
└─────────────────┘       │ created_at      │
                          └─────────────────┘
```

## 3. SERVICE LAYER

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API SERVICES                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Auth       │  │  Feed       │  │  Posts      │  │  Users      │        │
│  │  Service    │  │  Service    │  │  Service    │  │  Service    │        │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤  ├─────────────┤        │
│  │ • Clerk     │  │ • Generate  │  │ • CRUD      │  │ • Profile   │        │
│  │   verify    │  │   daily     │  │ • Search    │  │ • Streaks   │        │
│  │ • Session   │  │ • Personalize│ │ • Filter    │  │ • Prefs     │        │
│  │   mgmt      │  │ • Rank      │  │ • Embed     │  │ • Stats     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Interaction │  │ Reflection  │  │ Notification│  │ AI/ML       │        │
│  │ Service     │  │ Service     │  │ Service     │  │ Service     │        │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤  ├─────────────┤        │
│  │ • Like      │  │ • Create    │  │ • Push      │  │ • Generate  │        │
│  │ • Save      │  │ • Feature   │  │ • Email     │  │   embeddings│        │
│  │ • Complete  │  │ • Moderate  │  │ • Digest    │  │ • Recommend │        │
│  │ • Track     │  │ • Surface   │  │ • Schedule  │  │ • Summarize │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 4. AI/ML PIPELINE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AI PERSONALIZATION ENGINE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   INGESTION                    PROCESSING                    OUTPUT         │
│                                                                              │
│  ┌───────────┐              ┌───────────┐               ┌───────────┐      │
│  │ User      │─────────────▶│ Generate  │──────────────▶│ Quote     │      │
│  │ Behavior  │              │ Embeddings│               │ Ranking   │      │
│  │ (clicks,  │              │ (OpenAI)  │               │ Score     │      │
│  │  saves,   │              │           │               │           │      │
│  │  completes│              │ Post:     │               │ User:     │      │
│  │  reflects)│              │ 1536-dim  │               │ preference│      │
│  └───────────┘              │ vector    │               │ vector    │      │
│                             └───────────┘               └─────┬─────┘      │
│                                    │                          │            │
│  ┌───────────┐              ┌──────┴──────┐                  │            │
│  │ Content   │─────────────▶│ Vector DB   │◀─────────────────┘            │
│  │ (quotes,  │              │ (Pinecone)  │     Similarity Search         │
│  │  metadata)│              │             │     + Filtering               │
│  └───────────┘              └─────────────┘                               │
│                                                                              │
│  RANKING ALGORITHM:                                                          │
│  ─────────────────                                                           │
│  score = (category_match × 0.3) +                                            │
│          (difficulty_match × 0.2) +                                          │
│          (streak_gap_boost × 0.25) +                                         │
│          (freshness × 0.15) +                                                │
│          (engagement_prediction × 0.1)                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 5. CLIENT ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NEXT.JS 16 APP STRUCTURE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  app/                                                                        │
│  ├── (auth)/                 # Auth group (no layout)                        │
│  │   ├── sign-in/                                                            │
│  │   └── sign-up/                                                            │
│  │                                                                            │
│  ├── (main)/                 # Main app with layout                          │
│  │   ├── layout.tsx          # Root layout + providers                       │
│  │   ├── page.tsx            # Feed (home)                                   │
│  │   ├── post/[slug]/        # Individual post page                          │
│  │   ├── deep-dive/[id]/     # Long-form content                             │
│  │   ├── profile/            # User profile                                  │
│  │   ├── streaks/            # Streak dashboard                              │
│  │   ├── reflections/        # User reflections                             │
│  │   └── settings/           # Preferences                                   │
│  │                                                                            │
│  ├── api/                    # API routes                                    │
│  │   ├── feed/               # Feed generation                               │
│  │   ├── posts/              # Post CRUD                                     │
│  │   ├── interactions/       # Like/save/complete                            │
│  │   ├── reflections/        # Reflection CRUD                               │
│  │   ├── recommendations/    # AI recommendations                            │
│  │   └── webhooks/           # Clerk webhooks                                │
│  │                                                                            │
│  └── layout.tsx              # Root layout                                   │
│                                                                              │
│  components/                                                                 │
│  ├── feed/                   # Feed-specific components                      │
│  │   ├── Feed.tsx                                                            │
│  │   ├── FeedCard.tsx                                                        │
│  │   ├── FeedSkeleton.tsx                                                    │
│  │   └── EmptyState.tsx                                                      │
│  │                                                                            │
│  ├── post/                   # Post display components                       │
│  │   ├── QuoteBlock.tsx                                                      │
│  │   ├── TalkBlock.tsx                                                       │
│  │   ├── UsageBlock.tsx                                                      │
│  │   ├── EngagementBar.tsx                                                   │
│  │   └── ReflectionInput.tsx                                                 │
│  │                                                                            │
│  ├── ui/                     # shadcn/ui components                          │
│  ├── layout/                 # Layout components                             │
│  └── providers/              # Context providers                             │
│                                                                              │
│  hooks/                                                                      │
│  ├── useFeed.ts              # Feed data + mutations                         │
│  ├── usePost.ts              # Single post data                              │
│  ├── useStreaks.ts           # Streak data                                   │
│  ├── useInteractions.ts      # Like/save/complete                            │
│  ├── useRealtime.ts          # Supabase realtime                             │
│  └── useAIRecommendations.ts # AI personalization                            │
│                                                                              │
│  lib/                                                                        │
│  ├── db/                     # Database client                               │
│  ├── ai/                     # OpenAI client                                 │
│  ├── auth/                   # Clerk helpers                                 │
│  ├── utils.ts                # Utilities                                     │
│  └── constants.ts            # App constants                                 │
│                                                                              │
│  types/                                                                      │
│  └── index.ts                # TypeScript definitions                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 6. REAL-TIME ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         REAL-TIME FEATURES                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Supabase Realtime Channels:                                                 │
│  ───────────────────────────                                                 │
│                                                                              │
│  Channel: `user:${userId}`                                                   │
│  ├── NEW_POST          → Push new post to feed                               │
│  ├── STREAK_UPDATE     → Update streak counter                               │
│  ├── REFLECTION_FEATURED → Your reflection was featured                      │
│  └── NOTIFICATION      → Generic notification                                │
│                                                                              │
│  Channel: `post:${postId}`                                                   │
│  ├── ENGAGEMENT_UPDATE → Live like/save counts                               │
│  ├── NEW_REFLECTION    → New public reflection                               │
│  └── COMPLETION_MILESTONE → 100/1000 completions                             │
│                                                                              │
│  Channel: `global`                                                           │
│  ├── TRENDING_POST     → Post hitting viral threshold                        │
│  └── SYSTEM_MESSAGE    → Maintenance, announcements                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 7. NOTIFICATION SYSTEM

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NOTIFICATION TRIGGERS                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PUSH NOTIFICATIONS (Daily):                                                 │
│  ───────────────────────────                                                 │
│  • 8:00 AM  → "Your daily wisdom is ready"                                   │
│  • 8:00 PM  → "Don't break your streak" (if not completed)                   │
│                                                                              │
│  EMAIL DIGEST (Weekly):                                                      │
│  ──────────────────────                                                      │
│  • Sunday 6:00 PM → Week in review                                           │
│    - Streak status                                                           │
│    - Top posts you engaged with                                              │
│    - Your reflections                                                        │
│    - Recommended focus for next week                                         │
│                                                                              │
│  SMART TRIGGERS:                                                             │
│  ────────────────                                                            │
│  • Streak at risk (23h since last completion)                                │
│  • Reflection featured                                                       │
│  • New deep dive available                                                   │
│  • Milestone reached (7, 30, 100 days)                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 8. DEPLOYMENT ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PRODUCTION SETUP                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Vercel (Frontend)                                                           │
│  ─────────────────                                                           │
│  • Production: canon.app                                                     │
│  • Staging: staging.canon.app                                                │
│  • Preview: [branch]-canon.vercel.app                                        │
│                                                                              │
│  Supabase (Database + Auth + Realtime)                                       │
│  ─────────────────────────────────────────                                   │
│  • Primary: us-east-1                                                        │
│  • Read replicas: auto-scaled                                                │
│  • Backups: daily                                                            │
│                                                                              │
│  Pinecone (Vector DB)                                                        │
│  ─────────────────────                                                       │
│  • Environment: production                                                   │
│  • Dimension: 1536                                                           │
│  • Metric: cosine                                                            │
│                                                                              │
│  OpenAI (AI/ML)                                                              │
│  ────────────────                                                            │
│  • Model: text-embedding-3-small (embeddings)                                │
│  • Model: gpt-4o-mini (summaries, recommendations)                           │
│  • Rate limits: monitored                                                    │
│                                                                              │
│  Upstash (Redis - optional caching)                                          │
│  ────────────────────────────────────                                        │
│  • Feed cache: 5 minutes                                                     │
│  • Session store: 24 hours                                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 9. SECURITY MODEL

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SECURITY LAYERS                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Authentication: Clerk.com                                                   │
│  ─────────────────────────                                                   │
│  • JWT tokens                                                                │
│  • Session management                                                        │
│  • MFA (optional)                                                            │
│                                                                              │
│  Authorization: RLS (Row Level Security)                                     │
│  ────────────────────────────────────────                                    │
│  • Users: can only read/update own data                                      │
│  • Posts: public read, admin write                                           │
│  • Reflections: public if is_public=true, otherwise owner only               │
│  • Interactions: owner only                                                  │
│                                                                              │
│  API Security:                                                               │
│  ────────────────                                                            │
│  • Rate limiting: 100 req/min per user                                       │
│  • Input validation: Zod schemas                                             │
│  • SQL injection: prevented by ORM                                           │
│                                                                              │
│  Data Privacy:                                                               │
│  ──────────────                                                              │
│  • PII encrypted at rest                                                     │
│  • Reflections anonymized for AI training                                    │
│  • GDPR deletion supported                                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 10. FEATURE ROADMAP

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DEVELOPMENT PHASES                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PHASE 1: MVP (Weeks 1-2)          ✅ DONE / 🔄 IN PROGRESS                  │
│  ─────────────────────────                                                   │
│  ✅ Database schema with 50 quotes                                           │
│  ✅ TypeScript types and JSON schemas                                        │
│  ✅ Next.js scaffold with Tailwind                                           │
│  ✅ Basic feed with mock data                                                │
│  ✅ Post cards (Quote/Talk/Usage)                                            │
│  🔄 Clerk auth integration                                                   │
│  🔄 Supabase connection                                                      │
│                                                                              │
│  PHASE 2: CORE (Weeks 3-4)                                                   │
│  ─────────────────────────                                                   │
│  ⬜ Real database with all 50 quotes                                         │
│  ⬜ User authentication flow                                                 │
│  ⬜ Streak tracking                                                          │
│  ⬜ Interactions (like/save/complete)                                        │
│  ⬜ Reflection input + storage                                               │
│  ⬜ Daily feed generation                                                    │
│  ⬜ Category filtering                                                        │
│                                                                              │
│  PHASE 3: AI (Weeks 5-6)                                                     │
│  ───────────────────────                                                     │
│  ⬜ OpenAI embeddings for all posts                                          │
│  ⬜ Pinecone vector database setup                                            │
│  ⬜ Recommendation algorithm                                                 │
│  ⬜ Personalized feed ranking                                                │
│  ⬜ AI-generated daily nudges                                                │
│                                                                              │
│  PHASE 4: SOCIAL (Weeks 7-8)                                                 │
│  ─────────────────────────                                                   │
│  ⬜ Public reflections (opt-in)                                              │
│  ⬜ Anonymized streak leaderboard                                            │
│  ⬜ Community insights                                                       │
│  ⬜ Featured reflections                                                     │
│  ⬜ Social proof on posts                                                    │
│                                                                              │
│  PHASE 5: SCALE (Weeks 9-10)                                                 │
│  ───────────────────────────                                                 │
│  ⬜ Push notifications                                                       │
│  ⬜ Email digests                                                            │
│  ⬜ Deep dive content pages                                                  │
│  ⬜ Performance optimization                                                 │
│  ⬜ Analytics dashboard                                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 11. KEY TECHNICAL DECISIONS

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js 16 | App Router, SSR, Vercel deployment |
| Styling | Tailwind 4 + shadcn | Speed, consistency, no CSS bloat |
| Database | Supabase PostgreSQL | Realtime, auth, generous free tier |
| Auth | Clerk | Better UX than Supabase Auth, easy integration |
| AI | OpenAI + Pinecone | Best embeddings, managed vector DB |
| Realtime | Supabase Channels | Built-in, no extra infrastructure |
| Hosting | Vercel | Edge functions, global CDN, zero config |
| State | Zustand + React Query | Simple, performant, server state handled |

## 12. API ENDPOINTS

```
GET    /api/feed              → Generate personalized daily feed
POST   /api/feed/refresh      → Force refresh feed

GET    /api/posts             → List posts (admin/filtered)
GET    /api/posts/:id         → Get single post
POST   /api/posts             → Create post (admin)

POST   /api/interactions      → Like/save/complete
DELETE /api/interactions      → Remove interaction

GET    /api/reflections       → List user reflections
POST   /api/reflections       → Create reflection
PATCH  /api/reflections/:id   → Update reflection

GET    /api/recommendations   → Get AI recommendations
POST   /api/embeddings/sync   → Sync post embeddings (admin)

GET    /api/streaks           → Get user streaks
GET    /api/streaks/leaderboard → Anonymized leaderboard

GET    /api/notifications     → Get user notifications
PATCH  /api/notifications/:id → Mark as read
```

---

**This is the complete architecture. Every piece connects. Nothing is missing.**

Ready to build Phase 2?