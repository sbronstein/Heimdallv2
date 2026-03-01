import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pipelineStages } from './schema/pipeline-stages';

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  console.log('Seeding pipeline stages...');

  await db.insert(pipelineStages).values([
    {
      name: 'researching',
      displayName: 'Researching',
      displayOrder: 0,
      color: '#6B7280',
      isTerminal: false,
      isActive: true,
    },
    {
      name: 'applied',
      displayName: 'Applied',
      displayOrder: 1,
      color: '#3B82F6',
      isTerminal: false,
      isActive: true,
    },
    {
      name: 'recruiter_screen',
      displayName: 'Recruiter Screen',
      displayOrder: 2,
      color: '#8B5CF6',
      isTerminal: false,
      isActive: true,
    },
    {
      name: 'phone_interview',
      displayName: 'Phone Interview',
      displayOrder: 3,
      color: '#A855F7',
      isTerminal: false,
      isActive: true,
    },
    {
      name: 'onsite',
      displayName: 'Onsite',
      displayOrder: 4,
      color: '#EC4899',
      isTerminal: false,
      isActive: true,
    },
    {
      name: 'final_round',
      displayName: 'Final Round',
      displayOrder: 5,
      color: '#F59E0B',
      isTerminal: false,
      isActive: true,
    },
    {
      name: 'offer',
      displayName: 'Offer',
      displayOrder: 6,
      color: '#10B981',
      isTerminal: false,
      isActive: true,
    },
    {
      name: 'negotiating',
      displayName: 'Negotiating',
      displayOrder: 7,
      color: '#F97316',
      isTerminal: false,
      isActive: true,
    },
    {
      name: 'accepted',
      displayName: 'Accepted',
      displayOrder: 8,
      color: '#22C55E',
      isTerminal: true,
      isActive: true,
    },
    {
      name: 'rejected',
      displayName: 'Rejected',
      displayOrder: 9,
      color: '#EF4444',
      isTerminal: true,
      isActive: true,
    },
    {
      name: 'withdrawn',
      displayName: 'Withdrawn',
      displayOrder: 10,
      color: '#9CA3AF',
      isTerminal: true,
      isActive: true,
    },
    {
      name: 'ghosted',
      displayName: 'Ghosted',
      displayOrder: 11,
      color: '#D1D5DB',
      isTerminal: true,
      isActive: true,
    },
    {
      name: 'on_hold',
      displayName: 'On Hold',
      displayOrder: 12,
      color: '#FBBF24',
      isTerminal: false,
      isActive: true,
    },
  ]);

  console.log('Pipeline stages seeded successfully.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
