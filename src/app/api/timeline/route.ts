import { db } from '@/lib/db';
import { timelineEvents } from '../../../../drizzle/schema';
import { desc, lt } from 'drizzle-orm';
import { paginated } from '@/lib/api/types';
import { serverError } from '@/lib/api/errors';
import { parseCursor, parseLimit } from '@/lib/api/filters';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseLimit(searchParams.get('limit'), 50);
    const cursor = parseCursor(searchParams.get('cursor'));

    const conditions = [];
    if (cursor) {
      conditions.push(lt(timelineEvents.occurredAt, cursor));
    }

    const results = await db
      .select()
      .from(timelineEvents)
      .where(conditions.length > 0 ? conditions[0] : undefined)
      .orderBy(desc(timelineEvents.occurredAt))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;

    return paginated(data, {
      cursor: data.length > 0 ? data[data.length - 1].occurredAt.toISOString() : null,
      hasMore
    });
  } catch (err) {
    return serverError(err);
  }
}
