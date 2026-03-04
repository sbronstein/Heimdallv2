import { db } from '@/lib/db';
import { notes } from '../../../../drizzle/schema';
import { desc, isNull } from 'drizzle-orm';
import { NoteTable } from './note-table';
import { columns } from './note-table/columns';

export default async function NoteListingPage() {
  const data = await db
    .select()
    .from(notes)
    .where(isNull(notes.archivedAt))
    .orderBy(desc(notes.updatedAt));

  return <NoteTable data={data} totalItems={data.length} columns={columns} />;
}
