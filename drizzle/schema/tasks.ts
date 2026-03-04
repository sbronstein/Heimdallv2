import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { taskStatusEnum, taskPriorityEnum } from './enums';
import { companies } from './companies';
import { contacts } from './contacts';
import { applications } from './applications';

export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Core
  title: text('title').notNull(),
  description: text('description'),
  status: taskStatusEnum('status').default('todo').notNull(),
  priority: taskPriorityEnum('priority').default('medium').notNull(),

  // Polymorphic links
  companyId: uuid('company_id').references(() => companies.id),
  contactId: uuid('contact_id').references(() => contacts.id),
  applicationId: uuid('application_id').references(() => applications.id),

  // Scheduling
  dueDate: timestamp('due_date'),
  completedAt: timestamp('completed_at'),

  // Tags
  tags: text('tags').array(),

  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});
