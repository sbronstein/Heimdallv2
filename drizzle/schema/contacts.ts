import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { contactRelationshipEnum, contactWarmthEnum } from './enums';
import { companies } from './companies';

export const contacts = pgTable(
  'contacts',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Core info
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    email: text('email'),
    phone: text('phone'),
    linkedinUrl: text('linkedin_url'),
    title: text('title'),
    currentCompany: text('current_company'),

    // Relationship to your search
    companyId: uuid('company_id').references(() => companies.id),
    relationship: contactRelationshipEnum('relationship').default('other'),
    warmth: contactWarmthEnum('warmth').default('cold'),
    introducedBy: uuid('introduced_by'),

    // Context
    notes: text('notes'),
    tags: text('tags').array(),
    howMet: text('how_met'),

    // Follow-up tracking
    lastContactDate: timestamp('last_contact_date'),
    nextFollowUpDate: timestamp('next_follow_up_date'),
    followUpNotes: text('follow_up_notes'),

    // Metadata
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    archivedAt: timestamp('archived_at'),
  },
  (table) => [
    index('contacts_company_idx').on(table.companyId),
    index('contacts_warmth_idx').on(table.warmth),
    index('contacts_next_follow_up_idx').on(table.nextFollowUpDate),
    index('contacts_tags_idx').using('gin', table.tags),
  ]
);
