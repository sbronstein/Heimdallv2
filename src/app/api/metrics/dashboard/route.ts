import { db } from '@/lib/db';
import {
  applications,
  companies,
  contacts,
  tasks,
  interactions
} from '../../../../../drizzle/schema';
import { sql, isNull, inArray, lte, gte, and, count } from 'drizzle-orm';
import { success } from '@/lib/api/types';
import { serverError } from '@/lib/api/errors';

export async function GET() {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      activeApps,
      companiesTracked,
      interviewsThisWeek,
      overdueFollowUps,
      stageCounts
    ] = await Promise.all([
      // Active applications (not terminal)
      db
        .select({ count: count() })
        .from(applications)
        .where(
          and(
            isNull(applications.archivedAt),
            inArray(applications.status, [
              'researching',
              'applied',
              'recruiter_screen',
              'phone_interview',
              'onsite',
              'final_round',
              'offer',
              'negotiating',
              'on_hold'
            ])
          )
        ),

      // Companies tracked
      db
        .select({ count: count() })
        .from(companies)
        .where(isNull(companies.archivedAt)),

      // Interviews this week
      db
        .select({ count: count() })
        .from(interactions)
        .where(
          and(
            inArray(interactions.type, ['interview', 'phone_call', 'video_call']),
            gte(interactions.occurredAt, weekAgo)
          )
        ),

      // Overdue follow-ups
      db
        .select({ count: count() })
        .from(contacts)
        .where(
          and(
            isNull(contacts.archivedAt),
            lte(contacts.nextFollowUpDate, now)
          )
        ),

      // Pipeline stage counts
      db
        .select({
          status: applications.status,
          count: count()
        })
        .from(applications)
        .where(isNull(applications.archivedAt))
        .groupBy(applications.status)
    ]);

    return success({
      activeApplications: activeApps[0]?.count || 0,
      companiesTracked: companiesTracked[0]?.count || 0,
      interviewsThisWeek: interviewsThisWeek[0]?.count || 0,
      overdueFollowUps: overdueFollowUps[0]?.count || 0,
      pipelineByStage: stageCounts
    });
  } catch (err) {
    return serverError(err);
  }
}
