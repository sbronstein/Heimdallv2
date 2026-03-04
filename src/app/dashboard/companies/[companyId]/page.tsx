import PageContainer from '@/components/layout/page-container';
import { db } from '@/lib/db';
import { companies, contacts, applications } from '../../../../../drizzle/schema';
import { eq, isNull, and } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import CompanyDetailPage from '@/features/companies/components/company-detail-page';
import CompanyForm from '@/features/companies/components/company-form';

type Props = {
  params: Promise<{ companyId: string }>;
  searchParams: Promise<{ edit?: string }>;
};

export default async function CompanyPage({ params, searchParams }: Props) {
  const { companyId } = await params;
  const { edit } = await searchParams;

  if (companyId === 'new') {
    return (
      <PageContainer pageTitle='Add Company' pageDescription='Create a new company to track.'>
        <CompanyForm initialData={null} pageTitle='Add New Company' />
      </PageContainer>
    );
  }

  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, companyId));

  if (!company) notFound();

  if (edit === 'true') {
    return (
      <PageContainer pageTitle='Edit Company' pageDescription={`Editing ${company.name}`}>
        <CompanyForm initialData={company} pageTitle={`Edit ${company.name}`} />
      </PageContainer>
    );
  }

  const companyContacts = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.companyId, companyId), isNull(contacts.archivedAt)));

  const companyApplications = await db
    .select()
    .from(applications)
    .where(
      and(eq(applications.companyId, companyId), isNull(applications.archivedAt))
    );

  return (
    <PageContainer pageTitle={company.name} pageDescription='Company details'>
      <CompanyDetailPage
        company={company}
        contacts={companyContacts}
        applications={companyApplications}
      />
    </PageContainer>
  );
}
