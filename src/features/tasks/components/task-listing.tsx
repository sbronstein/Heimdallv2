import { db } from '@/lib/db';
import { tasks } from '../../../../drizzle/schema';
import { desc } from 'drizzle-orm';
import { TaskTable } from './task-table';
import { columns } from './task-table/columns';

export default async function TaskListingPage() {
  const data = await db
    .select()
    .from(tasks)
    .orderBy(desc(tasks.updatedAt));

  return <TaskTable data={data} totalItems={data.length} columns={columns} />;
}
