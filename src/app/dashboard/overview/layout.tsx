import PageContainer from '@/components/layout/page-container';
import { KpiCards } from '@/features/overview/components/kpi-cards';
import { db } from '@/lib/db';
import { applications, companies, contacts, interactions } from '../../../../drizzle/schema';
import { count, isNull, and, inArray, gte, lte, eq } from 'drizzle-orm';
import React from 'react';

export default async function OverViewLayout({
  sales,
  pie_stats,
  bar_stats,
  area_stats
}: {
  sales: React.ReactNode;
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
}) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const [activeApps, companiesCount, interviewsCount, overdueCount] =
    await Promise.all([
      db
        .select({ count: count() })
        .from(applications)
        .where(
          and(
            isNull(applications.archivedAt),
            inArray(applications.status, [
              'applied',
              'recruiter_screen',
              'phone_interview',
              'onsite',
              'final_round',
              'offer',
              'negotiating'
            ])
          )
        ),
      db
        .select({ count: count() })
        .from(companies)
        .where(isNull(companies.archivedAt)),
      db
        .select({ count: count() })
        .from(interactions)
        .where(
          and(
            eq(interactions.type, 'interview'),
            gte(interactions.createdAt, startOfWeek),
            lte(interactions.createdAt, endOfWeek)
          )
        ),
      db
        .select({ count: count() })
        .from(contacts)
        .where(
          and(
            isNull(contacts.archivedAt),
            lte(contacts.nextFollowUpDate, now)
          )
        )
    ]);

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>
            Job Search Dashboard
          </h2>
        </div>

        <KpiCards
          activeApplications={activeApps[0].count}
          companiesTracked={companiesCount[0].count}
          interviewsThisWeek={interviewsCount[0].count}
          overdueFollowUps={overdueCount[0].count}
        />

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='col-span-4'>{bar_stats}</div>
          <div className='col-span-4 md:col-span-3'>{sales}</div>
          <div className='col-span-4'>{area_stats}</div>
          <div className='col-span-4 md:col-span-3'>{pie_stats}</div>
        </div>
      </div>
    </PageContainer>
  );
}
