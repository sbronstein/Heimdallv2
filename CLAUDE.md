# Heimdall — Job Search Command Center

## Stack
- Next.js 16 (App Router) on Vercel
- Neon Postgres with Drizzle ORM
- shadcn/ui + Tailwind v4 + Recharts
- Clerk auth
- pgvector for future semantic search

## Architecture
- Forked from next-shadcn-dashboard-starter
- `/app` — pages and layouts
- `/components/ui` — shadcn components
- `/lib/db` — Drizzle queries
- `/drizzle` — schema and migrations
- `/docs` — architecture and reference docs

## Key domain concepts
- Companies, Contacts, Applications, Interactions, Tasks, Notes
- Pipeline stages: Researching → Applied → Screen → Interview → Onsite → Final → Offer → Negotiating → Done
- CLI-first: all data mutations must work via API routes (no client-only state)

## For detailed reference
- @docs/job-search-playbook.md — full strategy and architecture report
- @docs/database-schema.md — detailed schema design
- @docs/api-conventions.md — API patterns
