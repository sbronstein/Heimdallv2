import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';
import { contacts } from './contacts';

export const recruiters = pgTable('recruiters', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Link to contacts table for full contact info
  contactId: uuid('contact_id')
    .references(() => contacts.id)
    .notNull(),

  // Recruiter-specific
  firm: text('firm'),
  specialty: text('specialty'),
  region: text('region'),

  // Relationship
  engagementStatus: text('engagement_status'),
  lastSubmittedTo: text('last_submitted_to'),
  qualityRating: integer('quality_rating'),

  // Notes
  notes: text('notes'),

  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
