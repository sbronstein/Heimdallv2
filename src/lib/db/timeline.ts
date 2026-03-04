import { db } from './index';
import { timelineEvents } from '../../../drizzle/schema';

type TimelineInput = {
  eventType: string;
  title: string;
  description?: string;
  companyId?: string;
  contactId?: string;
  applicationId?: string;
  interactionId?: string;
  taskId?: string;
  noteId?: string;
  metadata?: Record<string, unknown>;
};

export async function logTimeline(input: TimelineInput) {
  return db.insert(timelineEvents).values({
    ...input,
    occurredAt: new Date()
  });
}
