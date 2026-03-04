import PageContainer from '@/components/layout/page-container';
import { db } from '@/lib/db';
import {
  pipelineStages,
  applications,
  companies
} from '../../../../drizzle/schema';
import { asc, isNull, eq } from 'drizzle-orm';
import { PipelineViewPage } from '@/features/pipeline/components/pipeline-view-page';
import type { PipelineApplication } from '@/features/pipeline/utils/store';

export const metadata = {
  title: 'Dashboard: Pipeline'
};

export default async function PipelinePage() {
  const stages = await db
    .select()
    .from(pipelineStages)
    .orderBy(asc(pipelineStages.displayOrder));

  const apps = await db
    .select({
      id: applications.id,
      companyId: applications.companyId,
      companyName: companies.name,
      roleTitle: applications.roleTitle,
      status: applications.status,
      excitementLevel: applications.excitementLevel,
      statusChangedAt: applications.statusChangedAt,
      source: applications.source
    })
    .from(applications)
    .leftJoin(companies, eq(applications.companyId, companies.id))
    .where(isNull(applications.archivedAt));

  const pipelineApps: PipelineApplication[] = apps.map((a) => ({
    ...a,
    companyName: a.companyName || 'Unknown',
    statusChangedAt: a.statusChangedAt?.toISOString() || null
  }));

  const allCompanies = await db
    .select()
    .from(companies)
    .where(isNull(companies.archivedAt));

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Pipeline'
      pageDescription='Track applications through pipeline stages.'
    >
      <PipelineViewPage
        stages={stages}
        applications={pipelineApps}
        companies={allCompanies}
      />
    </PageContainer>
  );
}
