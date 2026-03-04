import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  boolean
} from 'drizzle-orm/pg-core';
import { interactionTypeEnum, interactionSentimentEnum } from './enums';
import { contacts } from './contacts';
import { companies } from './companies';
import { applications } from './applications';

export const interactions = pgTable('interactions', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Polymorphic links
  contactId: uuid('contact_id').references(() => contacts.id),
  companyId: uuid('company_id').references(() => companies.id),
  applicationId: uuid('application_id').references(() => applications.id),

  // Interaction details
  type: interactionTypeEnum('type').notNull(),
  direction: text('direction'),
  subject: text('subject'),
  content: text('content'),
  sentiment: interactionSentimentEnum('sentiment'),

  // Scheduling
  occurredAt: timestamp('occurred_at').defaultNow().notNull(),
  durationMinutes: integer('duration_minutes'),

  // Follow-up
  followUpRequired: boolean('follow_up_required').default(false),
  followUpDate: timestamp('follow_up_date'),
  followUpCompleted: boolean('follow_up_completed').default(false),

  // Context
  tags: text('tags').array(),
  metadata: jsonb('metadata'),

  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});
