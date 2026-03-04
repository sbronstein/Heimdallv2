import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TimelineEvent } from '@/lib/domain/types';
import { formatDistanceToNow } from 'date-fns';

interface ActivityTimelineProps {
  events: TimelineEvent[];
}

const eventIcons: Record<string, string> = {
  company_added: 'bg-blue-500',
  company_updated: 'bg-blue-400',
  application_added: 'bg-purple-500',
  application_status_changed: 'bg-orange-500',
  contact_added: 'bg-green-500',
  interaction_logged: 'bg-teal-500',
  task_created: 'bg-yellow-500',
  task_completed: 'bg-emerald-500',
  note_created: 'bg-indigo-500'
};

export function ActivityTimeline({ events }: ActivityTimelineProps) {
  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground py-8 text-center text-sm'>
            No activity yet. Start by adding companies or applications.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {events.slice(0, 10).map((event) => (
            <div key={event.id} className='flex items-start gap-3'>
              <div
                className={`mt-1 h-2 w-2 rounded-full ${eventIcons[event.eventType] || 'bg-gray-400'}`}
              />
              <div className='flex-1'>
                <p className='text-sm'>{event.title}</p>
                {event.description && (
                  <p className='text-muted-foreground text-xs'>
                    {event.description}
                  </p>
                )}
              </div>
              <span className='text-muted-foreground text-xs whitespace-nowrap'>
                {formatDistanceToNow(new Date(event.occurredAt), {
                  addSuffix: true
                })}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
