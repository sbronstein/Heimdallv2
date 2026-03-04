import { db } from '@/lib/db';
import { timelineEvents } from '../../../../../drizzle/schema';
import { desc } from 'drizzle-orm';
import { ActivityTimeline } from '@/features/overview/components/activity-timeline';

export default async function SalesPage() {
  const events = await db
    .select()
    .from(timelineEvents)
    .orderBy(desc(timelineEvents.occurredAt))
    .limit(10);

  return <ActivityTimeline events={events} />;
}
