# Heimdall — Job Search Command Center

A personal CRM and pipeline tracker for an executive job search targeting VP Data/AI roles at growth-stage companies. Built for dual interaction: web UI and Claude Code CLI.

## Stack

- **Framework**: Next.js 16 (App Router, Server Components by default)
- **Database**: Neon Postgres with Drizzle ORM
- **UI**: shadcn/ui + Tailwind CSS v4 + Recharts
- **Auth**: Clerk
- **Hosting**: Vercel
- **Vector search (Phase 2)**: pgvector on same Neon instance

## Project Structure

```
/app                  → Pages, layouts, API routes (App Router)
/app/api              → REST API routes (all data mutations go here)
/components/ui        → shadcn/ui primitives
/components           → Domain components (company-card, pipeline-board, etc.)
/lib/db               → Drizzle client, queries, helpers
/lib/actions          → Server actions (thin wrappers around db queries)
/drizzle              → Schema definitions, migrations, seed
/docs                 → Architecture reference (schema, API, playbook)
```

## Code Conventions

- TypeScript strict mode, named exports everywhere
- Server Components by default; add `'use client'` only when needed for interactivity
- All data mutations must go through `/app/api/` routes — never client-only state
- This ensures Claude Code can do everything the web UI can via HTTP calls
- Use Drizzle query builder, not raw SQL (except for pgvector queries)
- Prefer `async/await` over `.then()` chains
- Error handling: return `{ success: boolean, data?, error? }` from all API routes
- Use `zod` for request validation on all API routes

## Database

- Neon Postgres, connection via `DATABASE_URL` env var
- Drizzle ORM with `drizzle-kit` for migrations
- Schema defined in `/drizzle/schema/` — one file per table
- UUID primary keys, `created_at`/`updated_at` on every table
- Soft deletes via `archived_at` timestamp (never hard delete during active search)
- JSONB for semi-structured data (compensation details, interview panels, funding info)
- Postgres text arrays for tags

See `@docs/database-schema.md` for full schema with all tables and indexes.

## API Design

- RESTful routes under `/app/api/`
- Standard response envelope: `{ success, data, error, meta }`
- Pagination via cursor (not offset) using `updated_at` timestamps
- Filtering via query params
- All write operations also create a `timeline_events` record

See `@docs/api-conventions.md` for full patterns and examples.

## Key Domain Concepts

- **Companies**: Organizations being tracked (researching, targeting, or applied to)
- **Contacts**: People linked to companies — recruiters, hiring managers, network connections
- **Applications**: A specific role at a specific company progressing through pipeline stages
- **Interactions**: Every communication logged (emails, calls, interviews, intros)
- **Tasks**: To-dos and follow-up reminders linked to any entity
- **Notes**: Research, interview prep, STAR stories, weekly reflections
- **Timeline Events**: Denormalized activity feed for the dashboard
- **Search Metrics**: Weekly snapshots for JSC reporting and trend tracking

## Pipeline Stages

Researching → Applied → Recruiter Screen → Phone Interview → Onsite → Final Round → Offer → Negotiating → Accepted/Rejected/Withdrawn/Ghosted/On Hold

## Commands

```bash
npm run dev           # Start dev server (port 3000)
npm run build         # Production build
npm run db:generate   # Generate Drizzle migration from schema changes
npm run db:migrate    # Run pending migrations
npm run db:push       # Push schema directly (dev only)
npm run db:studio     # Open Drizzle Studio (visual DB browser)
npm run db:seed       # Seed pipeline stages and example data
```

## Environment Variables

Defined in `.env.local` (gitignored):

- `DATABASE_URL` — Neon Postgres connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk auth
- `CLERK_SECRET_KEY` — Clerk auth
- `OPENAI_API_KEY` — For embeddings (Phase 2)

## Testing

- Validate API routes return correct envelope format
- Test pipeline stage transitions (valid moves only)
- Test that all write operations create timeline events