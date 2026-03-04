import { db } from '@/lib/db';
import { applications } from '../../../../../drizzle/schema';
import { isNull, count } from 'drizzle-orm';
import { SourceBreakdown } from '@/features/overview/components/source-breakdown';

export default async function PieStatsPage() {
  const sourceCounts = await db
    .select({
      source: applications.source,
      count: count()
    })
    .from(applications)
    .where(isNull(applications.archivedAt))
    .groupBy(applications.source);

  return (
    <SourceBreakdown
      data={sourceCounts.map((s) => ({
        source: s.source || 'unknown',
        count: s.count
      }))}
    />
  );
}
