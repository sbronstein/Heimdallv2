import { db } from '@/lib/db';
import { applications } from '../../../../../drizzle/schema';
import { isNull, count } from 'drizzle-orm';
import { PipelineFunnel } from '@/features/overview/components/pipeline-funnel';

export default async function BarStatsPage() {
  const stageCounts = await db
    .select({
      status: applications.status,
      count: count()
    })
    .from(applications)
    .where(isNull(applications.archivedAt))
    .groupBy(applications.status);

  return (
    <PipelineFunnel
      data={stageCounts.map((s) => ({ status: s.status, count: s.count }))}
    />
  );
}
