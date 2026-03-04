import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  IconBriefcase,
  IconBuilding,
  IconUsers,
  IconAlertCircle
} from '@tabler/icons-react';

interface KpiCardsProps {
  activeApplications: number;
  companiesTracked: number;
  interviewsThisWeek: number;
  overdueFollowUps: number;
}

export function KpiCards({
  activeApplications,
  companiesTracked,
  interviewsThisWeek,
  overdueFollowUps
}: KpiCardsProps) {
  const cards = [
    {
      title: 'Active Applications',
      value: activeApplications,
      icon: IconBriefcase,
      description: 'Applications in pipeline'
    },
    {
      title: 'Companies Tracked',
      value: companiesTracked,
      icon: IconBuilding,
      description: 'Total companies'
    },
    {
      title: 'Interviews This Week',
      value: interviewsThisWeek,
      icon: IconUsers,
      description: 'Calls & interviews'
    },
    {
      title: 'Overdue Follow-ups',
      value: overdueFollowUps,
      icon: IconAlertCircle,
      description: 'Need attention',
      alert: overdueFollowUps > 0
    }
  ];

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {cards.map((card) => (
        <Card key={card.title} className={card.alert ? 'border-red-200 dark:border-red-900' : ''}>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardDescription>{card.title}</CardDescription>
              <card.icon className={`h-5 w-5 ${card.alert ? 'text-red-500' : 'text-muted-foreground'}`} />
            </div>
            <CardTitle className='text-2xl font-semibold tabular-nums'>
              {card.value}
            </CardTitle>
            <p className='text-muted-foreground text-xs'>{card.description}</p>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
