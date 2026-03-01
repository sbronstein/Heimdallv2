import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { companies } from './companies';
import { contacts } from './contacts';
import { applications } from './applications';

export const notes = pgTable('notes', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Core
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category'),

  // Polymorphic links (optional)
  companyId: uuid('company_id').references(() => companies.id),
  contactId: uuid('contact_id').references(() => contacts.id),
  applicationId: uuid('application_id').references(() => applications.id),

  // Tags
  tags: text('tags').array(),

  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  archivedAt: timestamp('archived_at'),
});
