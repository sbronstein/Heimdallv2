# Heimdall Database Schema

## Overview

Heimdall uses Neon Postgres with Drizzle ORM. The schema is designed around a VP-level executive job search where the primary workflow is deep relationship tracking across ~20-40 target companies, not high-volume application blasting.

Key design principles:

- **UUID primary keys** — URL-safe, prevents enumeration, works well with Drizzle + Neon
- **Timestamps everywhere** — `created_at` and `updated_at` on every table for activity feeds and sorting
- **JSONB for flexible metadata** — avoid premature schema expansion; store semi-structured data (interview panels, compensation breakdowns) in JSONB columns
- **Postgres arrays for tags** — simple, queryable, no join table needed for tagging
- **Soft deletes via `archived_at`** — never lose data during an active search
- **All mutations via API routes** — enables Claude Code CLI interaction alongside the web UI

## Drizzle Schema

### Enums

```typescript
// drizzle/schema/enums.ts
import { pgEnum } from 'drizzle-orm/pg-core';

export const companyStageEnum = pgEnum('company_stage', [
  'seed', 'series_a', 'series_b', 'series_c', 'series_d_plus',
  'growth', 'public', 'bootstrapped', 'unknown'
]);

export const companySizeEnum = pgEnum('company_size', [
  '1_10', '11_50', '51_100', '101_250', '251_500',
  '501_1000', '1001_5000', '5001_plus'
]);

export const companyPriorityEnum = pgEnum('company_priority', [
  'dream', 'strong', 'interested', 'exploring', 'backburner'
]);

export const remotePolicyEnum = pgEnum('remote_policy', [
  'remote', 'hybrid', 'onsite', 'flexible', 'unknown'
]);

export const applicationStatusEnum = pgEnum('application_status', [
  'researching', 'applied', 'recruiter_screen', 'phone_interview',
  'onsite', 'final_round', 'offer', 'negotiating',
  'accepted', 'rejected', 'withdrawn', 'ghosted', 'on_hold'
]);

export const applicationSourceEnum = pgEnum('application_source', [
  'referral', 'recruiter_inbound', 'recruiter_outbound',
  'linkedin', 'job_board', 'vc_talent_network', 'direct_application',
  'networking', 'conference', 'other'
]);

export const contactRelationshipEnum = pgEnum('contact_relationship', [
  'recruiter_internal', 'recruiter_external', 'hiring_manager',
  'peer', 'executive', 'board_member', 'investor',
  'former_colleague', 'friend', 'cold_contact', 'other'
]);

export const contactWarmthEnum = pgEnum('contact_warmth', [
  'hot', 'warm', 'lukewarm', 'cold'
]);

export const interactionTypeEnum = pgEnum('interaction_type', [
  'email_sent', 'email_received', 'linkedin_message_sent',
  'linkedin_message_received', 'phone_call', 'video_call',
  'coffee_chat', 'interview', 'follow_up', 'thank_you',
  'intro_requested', 'intro_made', 'referral_given',
  'informational', 'other'
]);

export const interactionSentimentEnum = pgEnum('interaction_sentiment', [
  'very_positive', 'positive', 'neutral', 'negative', 'very_negative'
]);

export const taskStatusEnum = pgEnum('task_status', [
  'todo', 'in_progress', 'waiting', 'done', 'cancelled'
]);

export const taskPriorityEnum = pgEnum('task_priority', [
  'urgent', 'high', 'medium', 'low'
]);

export const excitementLevelEnum = pgEnum('excitement_level', [
  '5_dream_role', '4_very_excited', '3_interested',
  '2_lukewarm', '1_not_interested'
]);
```

### Companies

The central entity. Every company you’re tracking, whether you’ve applied or are just researching.

```typescript
// drizzle/schema/companies.ts
import { pgTable, uuid, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
import {
  companyStageEnum, companySizeEnum, companyPriorityEnum, remotePoolEnum
} from './enums';

export const companies = pgTable('companies', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Core info
  name: text('name').notNull(),
  website: text('website'),
  linkedinUrl: text('linkedin_url'),
  industry: text('industry'),
  description: text('description'),

  // Company profile
  stage: companyStageEnum('stage').default('unknown'),
  size: companySizeEnum('size'),
  employeeCount: integer('employee_count'),
  location: text('location'), // HQ location
  remotePolicy: remotePolicy('remote_policy').default('unknown'),

  // Funding & financials (semi-structured — details change)
  fundingInfo: jsonb('funding_info'),
  // Example: { totalRaised: "$50M", lastRound: "Series B", lastRoundDate: "2025-06",
  //            investors: ["General Catalyst", "Battery Ventures"], valuation: "$200M" }

  // Search-specific
  priority: companyPriorityEnum('priority').default('exploring'),
  tags: text('tags').array(), // e.g. ['ai-native', 'boston', 'data-first']
  dataMaturity: text('data_maturity'), // freeform: "no data team" → "mature platform"

  // Key people & org context
  ceoBackground: text('ceo_background'), // experienced CEO is a key filter
  techLeadership: jsonb('tech_leadership'),
  // Example: { cto: "Jane Smith, ex-Stripe", vpEng: "Bob Lee, ex-Datadog" }

  // Research notes (rich text / markdown)
  researchNotes: text('research_notes'),

  // Status tracking
  status: text('status').default('active'), // active, passed, archived
  passedReason: text('passed_reason'),

  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  archivedAt: timestamp('archived_at'),
});
```

### Contacts

People you’re engaging with. Linked to companies but can exist independently (recruiters, mentors, JSC members).

```typescript
// drizzle/schema/contacts.ts
export const contacts = pgTable('contacts', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Core info
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  linkedinUrl: text('linkedin_url'),
  title: text('title'), // Current role/title
  currentCompany: text('current_company'), // Freeform (may differ from linked company)

  // Relationship to your search
  companyId: uuid('company_id').references(() => companies.id),
  relationship: contactRelationshipEnum('relationship').default('other'),
  warmth: contactWarmthEnum('warmth').default('cold'),
  introducedBy: uuid('introduced_by').references(() => contacts.id), // who connected you

  // Context
  notes: text('notes'),
  tags: text('tags').array(), // e.g. ['jsc-member', 'data-leader', 'boston']
  howMet: text('how_met'), // "NSA event", "Former colleague at Stitch Fix", etc.

  // Follow-up tracking
  lastContactDate: timestamp('last_contact_date'),
  nextFollowUpDate: timestamp('next_follow_up_date'),
  followUpNotes: text('follow_up_notes'),

  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  archivedAt: timestamp('archived_at'),
});
```

### Applications

The pipeline tracker. Each row is a specific role at a specific company progressing through stages.

```typescript
// drizzle/schema/applications.ts
export const applications = pgTable('applications', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Links
  companyId: uuid('company_id').references(() => companies.id).notNull(),

  // Role details
  roleTitle: text('role_title').notNull(),
  roleLevelConfirmed: text('role_level_confirmed'), // "VP", "Sr Dir", "Dir+"
  jobPostingUrl: text('job_posting_url'),
  jobDescription: text('job_description'), // Full JD text for reference/vector search
  department: text('department'),
  reportsTo: text('reports_to'), // "CTO", "CEO", "CPO"
  teamSize: text('team_size'), // "building from scratch" or "inheriting team of 12"

  // Pipeline
  status: applicationStatusEnum('status').default('researching').notNull(),
  statusChangedAt: timestamp('status_changed_at').defaultNow(),
  source: applicationSourceEnum('source'),
  referredBy: uuid('referred_by').references(() => contacts.id),

  // Dates
  appliedDate: timestamp('applied_date'),
  firstResponseDate: timestamp('first_response_date'),
  lastActivityDate: timestamp('last_activity_date'),

  // Assessment
  excitementLevel: excitementLevelEnum('excitement_level'),
  fitScore: integer('fit_score'), // 1-100, can be AI-generated later
  fitNotes: text('fit_notes'), // Why this is/isn't a good fit

  // Compensation
  compensationNotes: text('compensation_notes'), // Freeform initially
  compensationDetails: jsonb('compensation_details'),
  // Example: { baseLow: 280000, baseHigh: 340000, equity: "0.5-1.0%",
  //            bonus: "20%", signingBonus: 50000, otherPerks: "..." }

  // Interview tracking
  interviewPanel: jsonb('interview_panel'),
  // Example: [{ name: "Jane CTO", stage: "onsite", date: "2026-03-15",
  //             topics: ["technical vision", "team building"], notes: "..." }]

  // Resume version used
  resumeVersion: text('resume_version'),
  coverLetterUsed: boolean('cover_letter_used').default(false),
  tailoredMaterials: text('tailored_materials'), // Notes on what was customized

  // Outcome
  outcomeNotes: text('outcome_notes'), // What happened and why
  rejectionReason: text('rejection_reason'),
  offerDetails: jsonb('offer_details'),
  // Example: { base: 320000, equity: "0.75%", vestingSchedule: "4yr/1yr cliff",
  //            bonus: "20%", startDate: "2026-05-01", negotiationNotes: "..." }

  // Tags
  tags: text('tags').array(),

  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  archivedAt: timestamp('archived_at'),
});
```

### Interactions

Every meaningful communication. The activity log that powers the timeline and keeps you honest about follow-ups.

```typescript
// drizzle/schema/interactions.ts
export const interactions = pgTable('interactions', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Polymorphic links (at least one should be set)
  contactId: uuid('contact_id').references(() => contacts.id),
  companyId: uuid('company_id').references(() => companies.id),
  applicationId: uuid('application_id').references(() => applications.id),

  // Interaction details
  type: interactionTypeEnum('type').notNull(),
  direction: text('direction'), // 'inbound' or 'outbound'
  subject: text('subject'),
  content: text('content'), // Summary or full text
  sentiment: interactionSentimentEnum('sentiment'),

  // Scheduling
  occurredAt: timestamp('occurred_at').defaultNow().notNull(),
  duration: integer('duration_minutes'),

  // Follow-up
  followUpRequired: boolean('follow_up_required').default(false),
  followUpDate: timestamp('follow_up_date'),
  followUpCompleted: boolean('follow_up_completed').default(false),

  // Context
  tags: text('tags').array(),
  metadata: jsonb('metadata'),
  // Example: { channel: "email", threadId: "...", meetingLink: "..." }

  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### Tasks

Reminders and to-dos linked to any entity. Drives the “what should I do today” view.

```typescript
// drizzle/schema/tasks.ts
export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Core
  title: text('title').notNull(),
  description: text('description'),
  status: taskStatusEnum('status').default('todo').notNull(),
  priority: taskPriorityEnum('priority').default('medium').notNull(),

  // Polymorphic links (optional — tasks can be standalone)
  companyId: uuid('company_id').references(() => companies.id),
  contactId: uuid('contact_id').references(() => contacts.id),
  applicationId: uuid('application_id').references(() => applications.id),

  // Scheduling
  dueDate: timestamp('due_date'),
  completedAt: timestamp('completed_at'),

  // Tags
  tags: text('tags').array(),

  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### Notes

Longer-form research, prep, and reflections. Linked to entities or standalone (e.g., weekly search reflections, STAR story prep).

```typescript
// drizzle/schema/notes.ts
export const notes = pgTable('notes', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Core
  title: text('title').notNull(),
  content: text('content').notNull(), // Markdown
  category: text('category'), // 'research', 'interview_prep', 'reflection', 'star_story', 'general'

  // Polymorphic links (optional)
  companyId: uuid('company_id').references(() => companies.id),
  contactId: uuid('contact_id').references(() => contacts.id),
  applicationId: uuid('application_id').references(() => applications.id),

  // Tags
  tags: text('tags').array(),

  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  archivedAt: timestamp('archived_at'),
});
```

### Pipeline Stages (Lookup)

Customizable Kanban columns. Seeded with defaults but editable.

```typescript
// drizzle/schema/pipeline-stages.ts
export const pipelineStages = pgTable('pipeline_stages', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Core
  name: text('name').notNull().unique(), // Matches applicationStatusEnum values
  displayName: text('display_name').notNull(),
  displayOrder: integer('display_order').notNull(),
  color: text('color').notNull(), // Hex color for UI

  // Behavior
  isTerminal: boolean('is_terminal').default(false), // accepted, rejected, withdrawn, ghosted
  isActive: boolean('is_active').default(true), // Can be hidden without deletion

  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Seed data:
// researching      → #6B7280 (gray)    order: 0
// applied          → #3B82F6 (blue)    order: 1
// recruiter_screen → #8B5CF6 (violet)  order: 2
// phone_interview  → #A855F7 (purple)  order: 3
// onsite           → #EC4899 (pink)    order: 4
// final_round      → #F59E0B (amber)   order: 5
// offer            → #10B981 (emerald)  order: 6
// negotiating      → #F97316 (orange)  order: 7
// accepted         → #22C55E (green)   order: 8  terminal
// rejected         → #EF4444 (red)     order: 9  terminal
// withdrawn        → #9CA3AF (gray)    order: 10 terminal
// ghosted          → #D1D5DB (ltgray)  order: 11 terminal
// on_hold          → #FBBF24 (yellow)  order: 12
```

### Timeline Events (Denormalized Activity Feed)

Powers the main dashboard activity feed without complex multi-table JOINs. Written to by triggers or application logic whenever something happens.

```typescript
// drizzle/schema/timeline-events.ts
export const timelineEvents = pgTable('timeline_events', {
  id: uuid('id').defaultRandom().primaryKey(),

  // What happened
  eventType: text('event_type').notNull(),
  // Examples: 'application_status_changed', 'interaction_logged',
  //           'task_completed', 'note_created', 'contact_added',
  //           'company_researched', 'follow_up_due'

  title: text('title').notNull(), // Human-readable: "Moved Acme Corp to Phone Interview"
  description: text('description'), // Optional detail

  // Links (at least one should be set)
  companyId: uuid('company_id').references(() => companies.id),
  contactId: uuid('contact_id').references(() => contacts.id),
  applicationId: uuid('application_id').references(() => applications.id),
  interactionId: uuid('interaction_id').references(() => interactions.id),
  taskId: uuid('task_id').references(() => tasks.id),
  noteId: uuid('note_id').references(() => notes.id),

  // Flexible data
  metadata: jsonb('metadata'),
  // Example for status change: { from: "applied", to: "recruiter_screen" }
  // Example for interaction: { type: "email_sent", contact: "Jane Smith" }

  // When
  occurredAt: timestamp('occurred_at').defaultNow().notNull(),

  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### Recruiters

Dedicated table for external recruiter relationships since they span multiple companies and searches.

```typescript
// drizzle/schema/recruiters.ts
export const recruiters = pgTable('recruiters', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Link to contacts table for full contact info
  contactId: uuid('contact_id').references(() => contacts.id).notNull(),

  // Recruiter-specific
  firm: text('firm'), // "Riviera Partners", "Heidrick & Struggles"
  specialty: text('specialty'), // "VP Data/AI", "C-suite tech"
  region: text('region'), // "Boston/Northeast", "National"

  // Relationship
  engagementStatus: text('engagement_status'), // 'active', 'dormant', 'one-off'
  lastSubmittedTo: text('last_submitted_to'), // Company name they last pitched you for
  qualityRating: integer('quality_rating'), // 1-5: how good are the roles they bring?

  // Notes
  notes: text('notes'),

  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### Search Metrics (Weekly Snapshots)

Captures weekly search health for trend tracking and JSC reporting.

```typescript
// drizzle/schema/search-metrics.ts
export const searchMetrics = pgTable('search_metrics', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Period
  weekStarting: timestamp('week_starting').notNull(),

  // Activity counts
  applicationsSubmitted: integer('applications_submitted').default(0),
  networkingConversations: integer('networking_conversations').default(0),
  interviewsCompleted: integer('interviews_completed').default(0),
  followUpsSent: integer('follow_ups_sent').default(0),
  newCompaniesResearched: integer('new_companies_researched').default(0),
  newContactsAdded: integer('new_contacts_added').default(0),

  // Pipeline snapshot
  activeApplications: integer('active_applications').default(0),
  offersReceived: integer('offers_received').default(0),
  rejections: integer('rejections').default(0),

  // Qualitative
  energyLevel: integer('energy_level'), // 1-10
  weeklyReflection: text('weekly_reflection'), // Markdown
  jscNotes: text('jsc_notes'), // Notes from JSC meeting

  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

## Indexes

Create these after the initial migration for query performance:

```typescript
// drizzle/schema/indexes.ts
import { index } from 'drizzle-orm/pg-core';

// Companies
index('companies_priority_idx').on(companies.priority);
index('companies_status_idx').on(companies.status);
index('companies_tags_idx').using('gin', companies.tags);

// Contacts
index('contacts_company_idx').on(contacts.companyId);
index('contacts_warmth_idx').on(contacts.warmth);
index('contacts_next_follow_up_idx').on(contacts.nextFollowUpDate);
index('contacts_tags_idx').using('gin', contacts.tags);

// Applications
index('applications_company_idx').on(applications.companyId);
index('applications_status_idx').on(applications.status);
index('applications_source_idx').on(applications.source);
index('applications_excitement_idx').on(applications.excitementLevel);

// Interactions
index('interactions_contact_idx').on(interactions.contactId);
index('interactions_company_idx').on(interactions.companyId);
index('interactions_application_idx').on(interactions.applicationId);
index('interactions_occurred_at_idx').on(interactions.occurredAt);
index('interactions_follow_up_idx').on(interactions.followUpDate)
  .where(sql`follow_up_required = true AND follow_up_completed = false`);

// Tasks
index('tasks_status_idx').on(tasks.status);
index('tasks_due_date_idx').on(tasks.dueDate);
index('tasks_priority_status_idx').on(tasks.priority, tasks.status);

// Timeline
index('timeline_occurred_at_idx').on(timelineEvents.occurredAt);
index('timeline_company_idx').on(timelineEvents.companyId);
index('timeline_event_type_idx').on(timelineEvents.eventType);

// Search Metrics
index('search_metrics_week_idx').on(searchMetrics.weekStarting);
```

## Phase 2: pgvector Columns

When you have 50+ applications and significant notes, add vector search:

```sql
-- Enable pgvector (one-time on Neon)
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding columns
ALTER TABLE applications
  ADD COLUMN job_description_embedding vector(1536);

ALTER TABLE notes
  ADD COLUMN content_embedding vector(1536);

ALTER TABLE companies
  ADD COLUMN description_embedding vector(1536);

-- Create HNSW indexes for fast similarity search
CREATE INDEX applications_embedding_idx
  ON applications USING hnsw (job_description_embedding vector_cosine_ops);

CREATE INDEX notes_embedding_idx
  ON notes USING hnsw (content_embedding vector_cosine_ops);
```

Use OpenAI `text-embedding-3-small` (1536 dimensions) to generate embeddings. Cost is negligible for a personal project (~$0.001 per 1000 embeddings).

Example queries once vectors are in place:

```sql
-- Find roles most similar to a specific job description
SELECT a.role_title, a.company_id, c.name as company_name,
       1 - (a.job_description_embedding <=> $1) as similarity
FROM applications a
JOIN companies c ON a.company_id = c.id
WHERE a.job_description_embedding IS NOT NULL
ORDER BY a.job_description_embedding <=> $1
LIMIT 5;

-- Find relevant prep notes for an upcoming interview
SELECT n.title, n.content,
       1 - (n.content_embedding <=> $1) as similarity
FROM notes n
WHERE n.content_embedding IS NOT NULL
ORDER BY n.content_embedding <=> $1
LIMIT 10;
```

## Entity Relationship Summary

```
companies 1──∞ contacts
companies 1──∞ applications
companies 1──∞ interactions
companies 1──∞ tasks
companies 1──∞ notes
companies 1──∞ timeline_events

contacts 1──∞ interactions
contacts 1──∞ tasks
contacts 1──∞ notes
contacts 1──1 recruiters
contacts 1──∞ contacts (introduced_by self-ref)
contacts 1──∞ applications (referred_by)

applications 1──∞ interactions
applications 1──∞ tasks
applications 1──∞ notes
applications 1──∞ timeline_events
```

## Seed Data

Include seed data for pipeline stages and a few example records to verify the schema works. Create as `drizzle/seed.ts`:

```typescript
// Seed pipeline stages with default colors and ordering
// Seed 2-3 example companies (e.g., "Acme Corp", "DataFlow Inc")
// Seed 1-2 contacts per company
// Seed 1 application in "researching" status
// Seed a few timeline events
```

## Claude Code CLI Interaction Patterns

The schema is designed so Claude Code can efficiently query and manipulate data via the Postgres MCP server. Common CLI operations:

```
"Show me all companies at 'strong' or 'dream' priority"
→ SELECT * FROM companies WHERE priority IN ('dream', 'strong') ORDER BY priority, name;

"Add a new contact at Acme Corp — Jane Smith, VP Engineering, met at NSA event"
→ INSERT INTO contacts (...) VALUES (...);
→ INSERT INTO timeline_events (...) VALUES (...);

"Move the DataFlow application to phone_interview"
→ UPDATE applications SET status = 'phone_interview', status_changed_at = NOW() WHERE ...;
→ INSERT INTO timeline_events (...) VALUES (...);

"What follow-ups are overdue?"
→ SELECT c.first_name, c.last_name, c.next_follow_up_date, co.name
   FROM contacts c LEFT JOIN companies co ON c.company_id = co.id
   WHERE c.next_follow_up_date < NOW() AND c.archived_at IS NULL;

"Give me a weekly summary"
→ Aggregate from timeline_events for the past 7 days, grouped by event_type
```