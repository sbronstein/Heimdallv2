import { db } from '@/lib/db';
import { companies } from '../../../../drizzle/schema';
import { desc, isNull } from 'drizzle-orm';
import { CompanyTable } from './company-table';
import { columns } from './company-table/columns';

export default async function CompanyListingPage() {
  const data = await db
    .select()
    .from(companies)
    .where(isNull(companies.archivedAt))
    .orderBy(desc(companies.updatedAt));

  return (
    <CompanyTable data={data} totalItems={data.length} columns={columns} />
  );
}
