import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
} from 'drizzle-orm/pg-core';

export const pipelineStages = pgTable('pipeline_stages', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Core
  name: text('name').notNull().unique(),
  displayName: text('display_name').notNull(),
  displayOrder: integer('display_order').notNull(),
  color: text('color').notNull(),

  // Behavior
  isTerminal: boolean('is_terminal').default(false),
  isActive: boolean('is_active').default(true),

  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
