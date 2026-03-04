import PageContainer from '@/components/layout/page-container';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import TaskListingPage from '@/features/tasks/components/task-listing';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard: Tasks'
};

export default function TasksPage() {
  return (
    <PageContainer
      scrollable={false}
      pageTitle='Tasks'
      pageDescription='Track to-dos, follow-ups, and action items across your job search.'
    >
      <Suspense
        fallback={<DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />}
      >
        <TaskListingPage />
      </Suspense>
    </PageContainer>
  );
}
