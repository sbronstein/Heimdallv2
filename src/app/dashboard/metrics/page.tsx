import { db } from '@/lib/db';
import { searchMetrics } from '../../../../drizzle/schema';
import { desc } from 'drizzle-orm';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { MetricsPage } from '@/features/metrics/components/metrics-page';

export default async function MetricsDashboardPage() {
  const snapshots = await db
    .select()
    .from(searchMetrics)
    .orderBy(desc(searchMetrics.weekStarting))
    .limit(52);

  return (
    <PageContainer>
      <div className="space-y-4">
        <Heading
          title="Search Metrics"
          description="Track your weekly job search activity and trends"
        />
        <MetricsPage snapshots={snapshots} />
      </div>
    </PageContainer>
  );
}
