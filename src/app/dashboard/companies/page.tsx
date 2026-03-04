import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import CompanyListingPage from '@/features/companies/components/company-listing';
import { cn } from '@/lib/utils';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard: Companies'
};

export default function CompaniesPage() {
  return (
    <PageContainer
      scrollable={false}
      pageTitle='Companies'
      pageDescription='Track and manage target companies for your job search.'
      pageHeaderAction={
        <Link
          href='/dashboard/companies/new'
          className={cn(buttonVariants(), 'text-xs md:text-sm')}
        >
          <IconPlus className='mr-2 h-4 w-4' /> Add Company
        </Link>
      }
    >
      <Suspense
        fallback={
          <DataTableSkeleton columnCount={7} rowCount={8} filterCount={2} />
        }
      >
        <CompanyListingPage />
      </Suspense>
    </PageContainer>
  );
}
