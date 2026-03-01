import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { interactionTypeEnum, interactionSentimentEnum } from './enums';
import { contacts } from './contacts';
import { companies } from './companies';
import { applications } from './applications';

export const interactions = pgTable(
  'interactions',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Polymorphic links (at least one should be set)
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
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('interactions_contact_idx').on(table.contactId),
    index('interactions_company_idx').on(table.companyId),
    index('interactions_application_idx').on(table.applicationId),
    index('interactions_occurred_at_idx').on(table.occurredAt),
  ]
);
