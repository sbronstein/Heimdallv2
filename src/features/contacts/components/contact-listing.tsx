import { db } from '@/lib/db';
import { contacts } from '../../../../drizzle/schema';
import { desc, isNull } from 'drizzle-orm';
import { ContactTable } from './contact-table';
import { columns } from './contact-table/columns';

export default async function ContactListingPage() {
  const data = await db
    .select()
    .from(contacts)
    .where(isNull(contacts.archivedAt))
    .orderBy(desc(contacts.updatedAt));

  return <ContactTable data={data} totalItems={data.length} columns={columns} />;
}
