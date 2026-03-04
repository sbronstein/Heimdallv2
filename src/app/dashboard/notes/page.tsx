import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import NoteListingPage from '@/features/notes/components/note-listing';
import { cn } from '@/lib/utils';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard: Notes'
};

export default function NotesPage() {
  return (
    <PageContainer
      scrollable={false}
      pageTitle='Notes'
      pageDescription='Research notes, interview prep, STAR stories, and weekly reflections.'
      pageHeaderAction={
        <Link
          href='/dashboard/notes/new'
          className={cn(buttonVariants(), 'text-xs md:text-sm')}
        >
          <IconPlus className='mr-2 h-4 w-4' /> New Note
        </Link>
      }
    >
      <Suspense
        fallback={<DataTableSkeleton columnCount={5} rowCount={8} filterCount={1} />}
      >
        <NoteListingPage />
      </Suspense>
    </PageContainer>
  );
}
