# Building a job search command center while running a VP-level search

A senior data leader targeting VP Data/VP AI roles can gain a significant edge by combining a purpose-built job search application with a structured, methodology-driven search strategy. This report covers both the technical architecture for building a personal command center with Claude Code and Next.js, and the current best practices for executive-level data/AI job searches in 2025-2026. The bottom line: **Neon Postgres on Vercel with a Claude Code CLI-first workflow** is the optimal tech stack, while the **Never Search Alone methodology combined with VC talent networks and specialized recruiters like Riviera Partners** represents the highest-ROI search strategy for VP-level roles.

-----

## AREA 1: Building the app with Claude Code

### The right stack: Neon Postgres, Drizzle, and a CLI-first architecture

The database decision is straightforward. **Neon Postgres** (Vercel’s native database partner) wins decisively over SQLite for this project. SQLite cannot run natively on Vercel’s serverless infrastructure   — you’d need Turso (libSQL) as an intermediary, adding complexity without benefit. Neon’s free tier provides  **191.9 compute hours/month and 512 MB storage**,   more than sufficient for a single-user CRM. The critical advantage: Neon includes **pgvector** as a built-in extension,   eliminating the need for a separate vector database entirely.

For the ORM, **Drizzle** edges out Prisma in 2026. Vercel’s own SaaS starter template now uses Drizzle, signaling the ecosystem’s direction. Drizzle produces **~90% smaller bundles** than Prisma, delivers faster serverless cold starts,  and its TypeScript-native schema definitions feel natural for Claude Code manipulation. The tradeoff is that Drizzle requires more SQL knowledge — but for a senior data leader, that’s an advantage, not a limitation.

The complete recommended stack:

|Layer        |Technology                      |Cost     |
|-------------|--------------------------------|---------|
|Framework    |Next.js 16 (App Router)         |Free     |
|Database     |Neon Postgres (via Vercel)      |Free tier|
|ORM          |Drizzle ORM                     |Free     |
|Vector search|pgvector (same Neon instance)   |Free     |
|UI           |shadcn/ui + Tailwind CSS v4     |Free     |
|Charts       |Recharts + Tremor               |Free     |
|Kanban       |dnd-kit + zustand               |Free     |
|Auth         |Clerk (10K MAUs free) or Auth.js|Free     |
|Hosting      |Vercel Hobby plan               |Free     |

**Total infrastructure cost: $0/month.** This entire stack runs within free tiers for a personal project.

### CLAUDE.md structure and memory management

The CLAUDE.md file is the single highest-leverage configuration point in Claude Code. It’s injected into every session’s system prompt,  but there’s a critical constraint: Claude Code’s system prompt already contains ~50 instructions, and frontier models reliably follow only **150-200 total instructions**.   Files under 200 lines achieve **>92% rule application rate** versus 71% beyond 400 lines. 

The recommended approach uses **progressive disclosure**  — keep CLAUDE.md lean and reference detailed docs: 

```markdown
# Job Search Command Center
Next.js 15 App Router + Neon PostgreSQL for tracking job applications, contacts, research.

## Architecture
- `/app`: Next.js App Router pages and layouts
- `/components/ui`: shadcn/ui components
- `/lib/db`: Database queries (Drizzle ORM)
- `/drizzle`: Schema and migrations
- `/docs`: Detailed architecture docs

## Commands
- `npm run dev`: Start dev server (port 3000)
- `npm run db:migrate`: Run Drizzle migrations
- `npm run db:studio`: Open Drizzle Studio

## Code Style
- TypeScript strict mode, named exports
- Server Components by default, 'use client' only when needed
- For schema details, see @docs/database-schema.md
- For API patterns, see @docs/api-conventions.md
```

Claude Code supports a **four-level memory hierarchy**: enterprise policy, project memory (CLAUDE.md), user memory (~/.claude/CLAUDE.md), and local project memory (CLAUDE.local.md).  For this project, put database credentials and sandbox URLs in CLAUDE.local.md (gitignored), project conventions in CLAUDE.md, and detailed architecture documentation in a `docs/` folder referenced via `@` imports. 

**Custom slash commands** are essential for a CLI-first workflow.  Create `.claude/commands/` with commands like `db-query.md` (query the database and report), `review.md` (code review checklist), and `deploy.md` (deployment procedure). These become available as `/project:db-query` inside Claude Code sessions. 

### MCP servers: the five you actually need

MCP (Model Context Protocol) servers transform Claude Code from a coding assistant into a full command center interface.   Here are the five servers worth configuring:

**1. Postgres MCP (essential).** The `@bytebase/dbhub` package is the simplest option — it enables natural language querying of your database directly from Claude Code. Configure with: `claude mcp add db -- npx -y @bytebase/dbhub --dsn "${DATABASE_URL}"`.  For production, `crystaldba/postgres-mcp` offers schema introspection, index tuning, and EXPLAIN plan analysis. 

**2. Context7 (highly recommended).** This server fetches **up-to-date, version-specific documentation** for Next.js, Drizzle, React, Tailwind, and 1,000+ other libraries. It prevents Claude from hallucinating deprecated APIs  — a common failure mode. Add “use context7” to prompts or configure auto-triggering in CLAUDE.md. 

**3. GitHub MCP.** Enables creating PRs, managing issues, and committing changes directly from Claude Code sessions.  Essential for the git-based workflow where each feature gets its own branch.

**4. Obsidian MCP (recommended).** The `obsidian-claude-code-mcp` plugin by iansinnott is purpose-built for Claude Code. It runs as an Obsidian plugin and Claude Code **auto-discovers it via WebSocket** — zero configuration needed.  This bridges your knowledge base with your development workflow.

**5. Filesystem MCP (situational).** Claude Code already has built-in file access within the project directory, so this is mainly useful for accessing files outside the project — your Obsidian vault, downloaded resumes, or reference documents.

A sample `.mcp.json` configuration:

```json
{
  "db": {
    "command": "npx",
    "args": ["-y", "@bytebase/dbhub", "--dsn", "${DATABASE_URL}"]
  },
  "context7": {
    "command": "npx",
    "args": ["-y", "@upstash/context7-mcp@latest"]
  },
  "github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}" }
  }
}
```

### Obsidian, vector databases, and where knowledge should live

The knowledge management architecture should follow a clear principle: **structured, queryable data in Postgres; rich narrative content in Obsidian; semantic search via pgvector on the same Postgres instance.**

**Obsidian** excels at unstructured knowledge that evolves over time: deep company research notes, interview preparation STAR stories with bidirectional links, networking strategy documents, and weekly search reflections. The bidirectional linking capability is particularly powerful for interview prep — link achievements to skills to prepared answers, then use the graph view to find hidden connections.   Multiple community templates exist, including `infews/job_search_in_obsidian`  (a full vault template) and a “brag document” system linking evidence to skills. 

**pgvector** (not ChromaDB, not Pinecone) is the right choice for vector search.  Since you’re already running Neon Postgres, enabling pgvector requires a single SQL command: `CREATE EXTENSION vector;`.   Add vector columns to your existing tables — embed job descriptions on the applications table, embed content on the notes table — and query with standard SQL JOINs. For a personal project with fewer than 100K vectors, pgvector performance is more than adequate.  ChromaDB adds operational complexity (separate server/process),   and Pinecone costs $50+/month  — neither justified when your database already supports vectors natively.

**When to add vector search:** Don’t build it into the MVP. Phase 1 should be the relational CRM. Add pgvector in Phase 2 once you have 50+ applications and significant notes, enabling semantic queries like “find roles most similar to this one” or “surface relevant interview prep notes for this company.” Generate embeddings using OpenAI’s `text-embedding-3-small` (1536 dimensions)   at negligible cost.

### Database schema for a job search CRM

The schema below represents battle-tested CRM patterns adapted for job search tracking. Ten tables cover the complete lifecycle:

**Core entities:** `companies` (name, stage, size, industry, remote policy, priority, status), `contacts` (linked to companies, with relationship type/strength, last contact date, next follow-up), and `applications` (the pipeline tracker with role, status, source, compensation notes, excitement level, and resume version tracking).

**Activity tracking:** `interactions` logs every communication (emails, calls, interviews, LinkedIn messages) with direction, sentiment, and follow-up flags. `tasks` provides reminder management linked polymorphically to companies, contacts, or applications. `notes` stores research documents and prep materials.

**Pipeline management:** A `pipeline_stages` lookup table enables customizable Kanban columns: Researching → Applied → Recruiter Screen → Phone Interview → Onsite → Final Round → Offer → Negotiating → Accepted/Rejected/Withdrawn/Ghosted. Each stage gets a display order and hex color for the UI.

**Dashboard support:** A denormalized `timeline_events` table with a JSONB `metadata` column enables fast activity feed rendering without complex JOINs across all entity types. Key design decisions include UUID primary keys  (URL-safe, prevents enumeration), Postgres arrays for flexible tagging, and proper indexes on frequently queried columns (status, dates, foreign keys).

### Open source projects worth studying

Three projects offer the most relevant inspiration:

**Kiranism/next-shadcn-dashboard-starter** (5,900 stars) is the best starting point for the frontend. It includes a drag-and-drop **Kanban board** (dnd-kit + zustand), analytics charts (Recharts), data tables (TanStack Table), Clerk authentication, and a complete admin dashboard layout — all built on Next.js 16 + shadcn/ui + Tailwind v4.   Fork this and add job-specific domain logic.

**Gsync/JobSync** (~206 stars) is the closest existing project to the target app: Next.js App Router, Prisma + PostgreSQL, shadcn/ui,  with AI resume review via Ollama.  Its Prisma schema is a solid reference for the data model. Study its application tracker, task management, and analytics dashboard implementations. 

**DaKheera47/job-ops** (~293 stars) is the most feature-rich AI-enhanced tracker. Its innovations include AI scoring (ranks jobs 0-100 based on your profile), auto-tailored resumes, Gmail email tracking (auto-detects interviews, offers, rejections),  and a keyboard-first UI with Cmd+K command bar.  While it uses React + Vite (not Next.js), its feature design is excellent reference material.

-----

## AREA 2: Executive job search strategy

### The VP Data/AI market: AI is the exception to a cautious hiring landscape

The 2025-2026 labor market presents a paradox for data leaders. Overall hiring activity has slowed to rates last seen in 2010-2013,  with Q4 2025 knowledge-work postings **down 23% year-over-year**.  Median time-to-first-offer stretched from 57 days to **83 days** over the course of 2025.  Yet AI-related job postings surged **130%+ above pre-pandemic baseline**, with nearly **45% of all data and analytics postings** now containing AI-related terms. 

The structural demand for data leadership has never been stronger. **84.3% of organizations** have now appointed a CDO/CDAO (up from 12% in 2012),  and an additional **33.1% have created a Chief AI Officer role**. A remarkable **98.4% of organizations are increasing investment** in data and AI. The VP Data role is converging with AI leadership — **67% of CDOs** report that AI or generative AI is their leading priority. 

For growth-stage companies specifically, startup hiring overall has declined **62% from the January 2022 peak**.  However, AI/ML salaries at startups are rising fastest: median AI/ML compensation is **up 9.1% over 18 months** at companies valued $1M-$10M.  The implication is clear: fewer VP Data roles are being created, but those that exist are better-compensated and more strategically important.

The skills most valued for VP Data/AI roles in 2026 are **AI/GenAI strategy and execution** (proven delivery, not theoretical knowledge), **data governance and AI-ready data foundations**, **business value translation** (connecting data/AI to revenue and cost savings), and **agentic AI and AI infrastructure** expertise. Leaders who demonstrate practical GenAI implementation experience — RAG systems, LLM fine-tuning, production ML — are commanding a **28-35% wage premium** over peers without AI specialization. 

### The $320K question: compensation benchmarks for Boston VP Data/AI

A base salary of **$320K positions the candidate above the 75th percentile** for VP Data/VP Data Science roles nationally. Glassdoor’s 2025-2026 data shows the 75th percentile for VP Data Science at approximately $302K, with the 90th percentile at ~$390K.  Self-reported Boston-area VP Data Science total compensation was $272K,  so a $320K base alone exceeds this substantially.

At growth-stage companies (100-500 employees, Series B-D), VP-level compensation typically ranges **$200K-$350K base plus equity**. Equity grants for VP-level hires at this stage generally represent **0.25-1.0%** of the company, depending on funding stage and role scope. Series C companies offer the best risk-reward ratio, with a **28.3% exit rate** — the highest weighted growth across all venture stages. 

The $320K target is realistic for well-funded growth-stage companies (Series B+) in Boston or remote-friendly positions, but would likely be above-market for seed or Series A companies. Adding meaningful equity (0.25-0.75% at a company with $500M+ potential exit value) creates a compelling total compensation package. The Never Search Alone methodology emphasizes negotiating not just compensation, but also **budget, resources, and organizational support** — the “four legs of the negotiation stool” that determine success in the role. 

### Never Search Alone: the methodology and how to execute it

The Never Search Alone movement, founded by Phyl Terry,  has scaled to **50,000+ job seekers helped** and **5,200+ Job Search Councils launched**  as of early 2026, with approximately 5,000 volunteers supporting the program. Terry is finishing a next book in the “Never Alone” series  and was recently featured on Lenny’s Podcast. 

The methodology follows five steps. First, **form a Job Search Council** — a group of 4-6 job-seeking peers  who commit to ~80 hours of work and the first 10 weekly meetings.  The JSC converts isolation into accountability, hope, and confidence.  Second, conduct a **Listening Tour** using the “Mnookin Two-Pager” (named after Harvard’s Allison Mnookin) — a summary of what you love/hate doing, must-haves/must-nots, career goals, and strengths/weaknesses.  During conversations, ask **“The Golden Question”**: *“If you were in my shoes, how would you approach this job search?”* 

Third, establish **Candidate-Market Fit** by identifying the intersection of your aspirations and market realities.  Fourth, execute **purposeful networking and interviewing** informed by your research. Fifth, **negotiate using the Four Legs framework** (compensation, budget, resources, support) and present a **“Job Mission with OKRs”** — your own version of the job description with clear objectives — to the hiring manager. 

To get started: sign up at neversearchalone.org for free JSC matching,  buy the book ($10),  and complete the required Zoom orientation.  The community also operates through LinkedIn groups and Terry’s broader Collaborative Gain network of 2,000+ senior leaders. 

### Where VP-level roles actually come from

At the VP level, **90%+ of roles are filled through referrals, warm introductions, or recruiter relationships** — not public job postings.  The highest-ROI channels, in priority order:

**Executive recruiters specializing in data/AI.** Riviera Partners stands out as the leading tech-focused executive search firm   with a dedicated **AI, ML & Data practice** led by Kyle Langworthy and Joe Ghory (formerly global head of AI practice at Russell Reynolds).  They’ve partnered with 300+ unicorns and use AI-driven matching across 600,000+ profiles. Heidrick & Struggles,  Russell Reynolds, Spencer Stuart, and Korn Ferry  all maintain data/AI practices but with broader focus. Boutique firms like True Search and Talentfoot also merit outreach.

**VC/PE talent networks** are a critical and underutilized channel for growth-stage roles. Major firms aggregate open positions across all portfolio companies.  For Boston specifically, **General Catalyst** (headquartered in Cambridge) and **Battery Ventures** (Boston-based) are the most relevant. Sign up for talent networks at a16z, Sequoia, Greylock, Index Ventures, Accel, and Y Combinator’s “Work at a Startup” board.  Platforms like **Getro** power 700+ VC job boards with AI matching  — register once and get auto-matched to relevant roles.

**Executive job platforms** like **ExecThread** ($25/month, 55,000+ executives, crowdsources confidential retained searches)  and **ExecuNet** ($39/month,  exclusive listings + networking events for $150K+ professionals)  surface roles that never appear on public boards. LinkedIn Premium (~$30/month) is table-stakes for VP-level search — the InMail credits and enhanced visibility are essential. 

### Networking that works: the listening tour and warm introductions

The most effective networking strategy for VP-level searches begins with **20-30+ informational conversations before actively interviewing**. Each conversation should accomplish three things: learn about market trends and company challenges, build authentic relationships, and generate 2-3 new introductions. The paradox: asking for informational conversations rather than jobs produces more job opportunities. 

When requesting introductions, make it frictionless — provide a brief forwardable email the connector can send. Lead with insight (“I noticed your company just raised Series C and is scaling its data infrastructure”), not a job pitch.  Cold outreach works when it offers genuine value: “I’ve built data orgs at similar stage companies and would love to exchange perspectives on [specific challenge they likely face].”

LinkedIn strategy for VP-level search requires an optimized headline  (e.g., “VP Data & AI | Scaling Data Orgs from 0→50 | Growth-Stage Tech”),  consistent thought leadership content (weekly posts sharing data/AI insights),  and strategic connecting with employees at target companies. Set your profile to “Open to Work” visible to recruiters only, with specific VP Data/VP AI title preferences.

### Interview preparation: what VP Data/AI interviews look like

VP-level data interviews typically span **5-8 rounds over 4-8 weeks**: recruiter screen, hiring manager deep-dive, technical/strategic assessment (usually a **data strategy presentation**), 3-5 stakeholder interviews (CPO, CTO, CFO, VP Engineering, VP Product), CEO/executive conversation, and sometimes a board member meeting at growth-stage companies.

The data strategy presentation is the make-or-break moment. Structure it as: current state assessment, quick wins (first 90 days), medium-term roadmap (6-12 months), long-term vision (12-24 months), team structure and hiring plan, tech stack recommendations, success metrics, and investment requirements. The Never Search Alone “Job Mission with OKRs” framework is a powerful differentiator here — presenting your own clearly articulated version of the role with measurable objectives demonstrates strategic thinking beyond what most candidates offer. 

Key preparation areas include **strategic vision** (“What would your first 90-day plan look like?”),  **team building** (“Who do you know that would join your team?” — this signals recruiting ability),  **technical depth** (demonstrate fluency in modern data stack, AI governance, LLM strategies without needing to code), and **business impact storytelling** (frame everything in terms of revenue, cost savings, and business outcomes, not model architectures).

### How AI tools should enhance (not replace) your search

Senior leaders in 2026 are using AI tools across the entire search lifecycle, but the key principle is **AI for preparation and refinement, not replacement**.  Anthropic’s own candidate guidance states: “Create your first draft yourself, then use Claude to refine it.” 

**Claude** excels at long-document analysis thanks to its 200K+ token context window — upload your full resume alongside a job description for nuanced gap analysis and section rewriting. **ChatGPT** works best for quick polish, cover letter drafts, and conversational tone adjustment. **Gemini** adds value for company research and competitive analysis.

The most advanced practitioners are building **multi-agent AI workflows** (using frameworks like CrewAI) that search job APIs, analyze descriptions, tailor resumes, draft cover letters, and prepare interview questions — all automated for roughly $2 in API credits per session.  However, a critical warning applies: **over-automation kills authenticity**. Experienced interviewers and hiring managers detect AI-generated outreach, and decision-makers are less likely to respond to templated messages.  Use AI to enhance the quality and speed of your preparation, then add genuine personal touches.

### Identifying the right growth-stage companies

Signals that a company in the 100-500 employee range is ready for a VP Data/AI hire include: a **recent funding round** (Series B-D companies in “prime hiring mode”),  **multiple data roles posted simultaneously** (3+ data engineer/scientist/analyst postings suggest they need a leader), **$10M-$100M ARR** (the range where data operations must formalize), and a **fractional-to-full-time transition** (companies using fractional data leaders increasingly convert to full-time VP at Series B+). 

Evaluate companies rigorously before engaging. Research **board composition** (experienced board members signal stronger governance), **VC quality** (Tier 1 investors significantly boost exit probability),  **burn rate and runway** (ask directly during interviews),  and **data maturity** (building from scratch versus scaling an existing function shapes the role entirely). Speak to former employees for unfiltered signal.  Red flags include secretive founders,  high executive turnover visible on LinkedIn, no clear AI/data priorities, and minimal equity offerings.

Use **Crunchbase** to filter by Boston location, Series B-D funding, 100-500 employees, and relevant industries. Cross-reference with VC portfolio pages from General Catalyst, Battery Ventures, and Bessemer (all Boston-based). Built In Boston covers the local tech ecosystem specifically.

## Conclusion

The technical and strategic aspects of this project reinforce each other. Building a personal job search command center with Claude Code isn’t just a useful tool — it demonstrates exactly the kind of AI-forward, data-driven approach that hiring managers seek in VP Data/AI candidates. The architecture is deliberately simple: **Neon Postgres handles structured data, vectors, and semantic search in a single free-tier service**, while Claude Code’s MCP ecosystem provides a powerful CLI interface that will likely become your primary interaction layer over the web UI.

On the search itself, three non-obvious insights emerged. First, the VP Data role is rapidly **converging with AI leadership** — candidates who can articulate an AI strategy grounded in data foundations have a decisive edge. Second, **VC talent networks** represent the highest-signal, lowest-competition channel for growth-stage roles,   yet most candidates ignore them. Third, the Never Search Alone methodology’s “Job Mission with OKRs” framework — presenting your own version of the role during final-round interviews — is a remarkably powerful differentiator  that most VP-level candidates never attempt. Start the JSC process and technical build simultaneously; the 83-day median time-to-offer means both tracks benefit from early action. 