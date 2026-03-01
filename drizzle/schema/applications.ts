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
import {
  applicationStatusEnum,
  applicationSourceEnum,
  excitementLevelEnum,
} from './enums';
import { companies } from './companies';
import { contacts } from './contacts';

export const applications = pgTable(
  'applications',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Links
    companyId: uuid('company_id')
      .references(() => companies.id)
      .notNull(),

    // Role details
    roleTitle: text('role_title').notNull(),
    roleLevelConfirmed: text('role_level_confirmed'),
    jobPostingUrl: text('job_posting_url'),
    jobDescription: text('job_description'),
    department: text('department'),
    reportsTo: text('reports_to'),
    teamSize: text('team_size'),

    // Pipeline
    status: applicationStatusEnum('status').default('researching').notNull(),
    statusChangedAt: timestamp('status_changed_at').defaultNow(),
    source: applicationSourceEnum('source'),
    referredBy: uuid('referred_by').references(() => contacts.id),

    // Dates
    appliedDate: timestamp('applied_date'),
    firstResponseDate: timestamp('first_response_date'),
    lastActivityDate: timestamp('last_activity_date'),

    // Assessment
    excitementLevel: excitementLevelEnum('excitement_level'),
    fitScore: integer('fit_score'),
    fitNotes: text('fit_notes'),

    // Compensation
    compensationNotes: text('compensation_notes'),
    compensationDetails: jsonb('compensation_details'),

    // Interview tracking
    interviewPanel: jsonb('interview_panel'),

    // Resume version used
    resumeVersion: text('resume_version'),
    coverLetterUsed: boolean('cover_letter_used').default(false),
    tailoredMaterials: text('tailored_materials'),

    // Outcome
    outcomeNotes: text('outcome_notes'),
    rejectionReason: text('rejection_reason'),
    offerDetails: jsonb('offer_details'),

    // Tags
    tags: text('tags').array(),

    // Metadata
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    archivedAt: timestamp('archived_at'),
  },
  (table) => [
    index('applications_company_idx').on(table.companyId),
    index('applications_status_idx').on(table.status),
    index('applications_source_idx').on(table.source),
    index('applications_excitement_idx').on(table.excitementLevel),
  ]
);
