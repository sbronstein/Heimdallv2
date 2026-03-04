import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { companies } from './companies';
import { contacts } from './contacts';
import { applications } from './applications';
import { interactions } from './interactions';
import { tasks } from './tasks';
import { notes } from './notes';

export const timelineEvents = pgTable('timeline_events', {
  id: uuid('id').defaultRandom().primaryKey(),

  // What happened
  eventType: text('event_type').notNull(),
  title: text('title').notNull(),
  description: text('description'),

  // Links
  companyId: uuid('company_id').references(() => companies.id),
  contactId: uuid('contact_id').references(() => contacts.id),
  applicationId: uuid('application_id').references(() => applications.id),
  interactionId: uuid('interaction_id').references(() => interactions.id),
  taskId: uuid('task_id').references(() => tasks.id),
  noteId: uuid('note_id').references(() => notes.id),

  // Flexible data
  metadata: jsonb('metadata'),

  // When
  occurredAt: timestamp('occurred_at').defaultNow().notNull(),

  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull()
});
