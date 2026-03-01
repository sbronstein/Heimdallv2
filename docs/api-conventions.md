# Heimdall API Conventions

## Overview

All data mutations go through REST API routes under `/app/api/`. This is a hard architectural requirement — it ensures Claude Code can perform every operation the web UI can via HTTP. Server actions may wrap API calls for form convenience but are never the sole path to a mutation.

## Response Envelope

Every API route returns this shape:

```typescript
// lib/api/types.ts
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    cursor?: string;    // For pagination
    hasMore?: boolean;
  };
};
```

Success example:

```json
{
  "success": true,
  "data": { "id": "uuid-123", "name": "Acme Corp", "priority": "strong" },
  "meta": null
}
```

Error example:

```json
{
  "success": false,
  "error": "Company not found",
  "data": null
}
```

List example:

```json
{
  "success": true,
  "data": [{ "id": "uuid-1", "name": "Acme" }, { "id": "uuid-2", "name": "DataFlow" }],
  "meta": { "total": 47, "cursor": "2026-03-01T14:30:00Z", "hasMore": true }
}
```

## HTTP Status Codes

|Code|Usage                                                |
|----|-----------------------------------------------------|
|200 |Success (GET, PUT, PATCH)                            |
|201 |Created (POST)                                       |
|204 |Deleted (DELETE — no body)                           |
|400 |Validation error (bad input, missing required fields)|
|404 |Entity not found                                     |
|500 |Unexpected server error                              |

## Route Structure

```
/app/api/
├── companies/
│   ├── route.ts              GET (list), POST (create)
│   └── [id]/
│       ├── route.ts          GET (detail), PUT (update), DELETE (archive)
│       ├── contacts/
│       │   └── route.ts      GET (contacts at this company)
│       └── applications/
│           └── route.ts      GET (applications at this company)
├── contacts/
│   ├── route.ts              GET (list), POST (create)
│   └── [id]/
│       ├── route.ts          GET, PUT, DELETE
│       └── interactions/
│           └── route.ts      GET (interactions with this contact)
├── applications/
│   ├── route.ts              GET (list), POST (create)
│   └── [id]/
│       ├── route.ts          GET, PUT, DELETE
│       └── status/
│           └── route.ts      PATCH (change pipeline status)
├── interactions/
│   ├── route.ts              GET (list), POST (create)
│   └── [id]/
│       └── route.ts          GET, PUT, DELETE
├── tasks/
│   ├── route.ts              GET (list), POST (create)
│   └── [id]/
│       └── route.ts          GET, PUT, DELETE
├── notes/
│   ├── route.ts              GET (list), POST (create)
│   └── [id]/
│       └── route.ts          GET, PUT, DELETE
├── timeline/
│   └── route.ts              GET (activity feed — read only)
├── metrics/
│   ├── route.ts              GET (list), POST (create weekly snapshot)
│   └── dashboard/
│       └── route.ts          GET (aggregated dashboard stats)
└── search/
    └── route.ts              GET (full-text search across entities)
```

## Request Validation

Use `zod` on every POST/PUT/PATCH route. Define schemas alongside routes:

```typescript
// app/api/companies/route.ts
import { z } from 'zod';

const createCompanySchema = z.object({
  name: z.string().min(1).max(200),
  website: z.string().url().optional(),
  linkedinUrl: z.string().url().optional(),
  industry: z.string().optional(),
  stage: z.enum(['seed', 'series_a', 'series_b', 'series_c',
                  'series_d_plus', 'growth', 'public', 'bootstrapped', 'unknown']).optional(),
  size: z.enum(['1_10', '11_50', '51_100', '101_250', '251_500',
                '501_1000', '1001_5000', '5001_plus']).optional(),
  priority: z.enum(['dream', 'strong', 'interested', 'exploring', 'backburner']).optional(),
  remotePolicy: z.enum(['remote', 'hybrid', 'onsite', 'flexible', 'unknown']).optional(),
  tags: z.array(z.string()).optional(),
  // ... other optional fields
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = createCompanySchema.parse(body);

    const company = await db.insert(companies).values(validated).returning();

    // Always log to timeline
    await db.insert(timelineEvents).values({
      eventType: 'company_added',
      title: `Added ${validated.name} to tracking`,
      companyId: company[0].id,
    });

    return Response.json({ success: true, data: company[0] }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Pagination

Use cursor-based pagination on `updated_at` (not offset — offset breaks when data changes):

```
GET /api/companies?limit=20&cursor=2026-03-01T14:30:00Z&sort=updated_at&order=desc
```

Implementation pattern:

```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
  const cursor = searchParams.get('cursor');

  let query = db.select().from(companies)
    .where(isNull(companies.archivedAt))
    .orderBy(desc(companies.updatedAt))
    .limit(limit + 1); // Fetch one extra to determine hasMore

  if (cursor) {
    query = query.where(lt(companies.updatedAt, new Date(cursor)));
  }

  const results = await query;
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;

  return Response.json({
    success: true,
    data,
    meta: {
      total: null, // Skip count queries for performance; use when needed
      cursor: data.length > 0 ? data[data.length - 1].updatedAt.toISOString() : null,
      hasMore,
    },
  });
}
```

## Filtering

Standard query param patterns for list endpoints:

```
GET /api/companies?priority=dream,strong&stage=series_b,series_c&tags=boston
GET /api/applications?status=recruiter_screen,phone_interview,onsite&excitement=5_dream_role,4_very_excited
GET /api/contacts?warmth=hot,warm&hasFollowUp=true
GET /api/tasks?status=todo,in_progress&priority=urgent,high&due=overdue
GET /api/interactions?type=interview&after=2026-02-01&before=2026-03-01
GET /api/timeline?limit=50&after=2026-02-24
```

Filtering implementation:

```typescript
// lib/api/filters.ts
export function parseArrayParam(param: string | null): string[] | null {
  if (!param) return null;
  return param.split(',').map(s => s.trim()).filter(Boolean);
}

// In route handler:
const priorities = parseArrayParam(searchParams.get('priority'));
if (priorities) {
  query = query.where(inArray(companies.priority, priorities));
}
```

## Timeline Event Creation

**Every write operation must create a timeline event.** This is the single most important convention — the timeline is the dashboard’s heartbeat and Claude Code’s primary way of understanding recent activity.

Helper function:

```typescript
// lib/db/timeline.ts
import { db } from './client';
import { timelineEvents } from '@/drizzle/schema/timeline-events';

type TimelineInput = {
  eventType: string;
  title: string;
  description?: string;
  companyId?: string;
  contactId?: string;
  applicationId?: string;
  interactionId?: string;
  taskId?: string;
  noteId?: string;
  metadata?: Record<string, unknown>;
};

export async function logTimeline(input: TimelineInput) {
  return db.insert(timelineEvents).values({
    ...input,
    occurredAt: new Date(),
  });
}
```

Usage in every mutation:

```typescript
// After creating a contact:
await logTimeline({
  eventType: 'contact_added',
  title: `Added ${contact.firstName} ${contact.lastName} (${contact.relationship})`,
  contactId: contact.id,
  companyId: contact.companyId,
});

// After changing application status:
await logTimeline({
  eventType: 'application_status_changed',
  title: `${company.name}: ${oldStatus} → ${newStatus}`,
  applicationId: application.id,
  companyId: application.companyId,
  metadata: { from: oldStatus, to: newStatus },
});

// After completing a task:
await logTimeline({
  eventType: 'task_completed',
  title: `Completed: ${task.title}`,
  taskId: task.id,
  companyId: task.companyId,
});
```

## Application Status Transitions

The `/api/applications/[id]/status` PATCH route should validate that transitions make sense. Not every status can move to every other status:

```typescript
// lib/domain/pipeline.ts
const validTransitions: Record<string, string[]> = {
  researching:      ['applied', 'withdrawn'],
  applied:          ['recruiter_screen', 'rejected', 'ghosted', 'withdrawn', 'on_hold'],
  recruiter_screen: ['phone_interview', 'rejected', 'ghosted', 'withdrawn', 'on_hold'],
  phone_interview:  ['onsite', 'rejected', 'ghosted', 'withdrawn', 'on_hold'],
  onsite:           ['final_round', 'offer', 'rejected', 'ghosted', 'withdrawn', 'on_hold'],
  final_round:      ['offer', 'rejected', 'ghosted', 'withdrawn', 'on_hold'],
  offer:            ['negotiating', 'accepted', 'rejected', 'withdrawn'],
  negotiating:      ['accepted', 'rejected', 'withdrawn'],
  on_hold:          ['applied', 'recruiter_screen', 'phone_interview', 'withdrawn', 'ghosted'],
  // Terminal states cannot transition (accepted, rejected, withdrawn, ghosted)
};

export function canTransition(from: string, to: string): boolean {
  return validTransitions[from]?.includes(to) ?? false;
}
```

## Search Endpoint

`/api/search` provides cross-entity full-text search:

```
GET /api/search?q=machine+learning&entities=companies,contacts,notes
```

Phase 1: Use Postgres `ILIKE` across name/title/content fields.
Phase 2: Use pgvector semantic search on embedded content.

## Claude Code CLI Usage Patterns

These API routes are designed to be called directly from Claude Code via `curl` or through the Postgres MCP server. Common patterns:

```bash
# Via MCP (direct database queries — fastest for reads)
"Show me all dream-priority companies"
→ SELECT * FROM companies WHERE priority = 'dream' AND archived_at IS NULL;

# Via API (required for writes — ensures timeline logging)
"Add Acme Corp as a strong priority company"
→ curl -X POST http://localhost:3000/api/companies \
    -H "Content-Type: application/json" \
    -d '{"name": "Acme Corp", "priority": "strong", "stage": "series_c"}'

# Via API (status change with validation)
"Move the Acme application to phone interview"
→ curl -X PATCH http://localhost:3000/api/applications/{id}/status \
    -H "Content-Type: application/json" \
    -d '{"status": "phone_interview"}'
```

For reads, the Postgres MCP server is faster and more flexible (arbitrary SQL). For writes, always use the API routes to ensure timeline events are created and validation runs.

## Error Handling Pattern

```typescript
// lib/api/errors.ts
export function notFound(entity: string) {
  return Response.json(
    { success: false, error: `${entity} not found` },
    { status: 404 }
  );
}

export function validationError(message: string) {
  return Response.json(
    { success: false, error: message },
    { status: 400 }
  );
}

export function serverError(error: unknown) {
  console.error('API Error:', error);
  return Response.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  );
}
```