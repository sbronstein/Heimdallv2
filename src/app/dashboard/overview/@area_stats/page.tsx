import { db } from '@/lib/db';
import { tasks, contacts } from '../../../../../drizzle/schema';
import { inArray, lte, asc, isNull, and } from 'drizzle-orm';
import { UpcomingTasks } from '@/features/overview/components/upcoming-tasks';
import { FollowUpReminders } from '@/features/overview/components/follow-up-reminders';

export default async function AreaStatsPage() {
  const endOfWeek = new Date();
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const [upcomingTasks, overdueContacts] = await Promise.all([
    db
      .select()
      .from(tasks)
      .where(
        and(
          inArray(tasks.status, ['todo', 'in_progress']),
          lte(tasks.dueDate, endOfWeek)
        )
      )
      .orderBy(asc(tasks.dueDate))
      .limit(5),
    db
      .select()
      .from(contacts)
      .where(
        and(
          isNull(contacts.archivedAt),
          lte(contacts.nextFollowUpDate, new Date())
        )
      )
      .limit(5)
  ]);

  return (
    <div className='space-y-4'>
      <UpcomingTasks tasks={upcomingTasks} />
      <FollowUpReminders contacts={overdueContacts} />
    </div>
  );
}
