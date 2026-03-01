import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  index,
} from 'drizzle-orm/pg-core';

export const searchMetrics = pgTable(
  'search_metrics',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Period
    weekStarting: timestamp('week_starting').notNull(),

    // Activity counts
    applicationsSubmitted: integer('applications_submitted').default(0),
    networkingConversations: integer('networking_conversations').default(0),
    interviewsCompleted: integer('interviews_completed').default(0),
    followUpsSent: integer('follow_ups_sent').default(0),
    newCompaniesResearched: integer('new_companies_researched').default(0),
    newContactsAdded: integer('new_contacts_added').default(0),

    // Pipeline snapshot
    activeApplications: integer('active_applications').default(0),
    offersReceived: integer('offers_received').default(0),
    rejections: integer('rejections').default(0),

    // Qualitative
    energyLevel: integer('energy_level'),
    weeklyReflection: text('weekly_reflection'),
    jscNotes: text('jsc_notes'),

    // Metadata
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [index('search_metrics_week_idx').on(table.weekStarting)]
);
