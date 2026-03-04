import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Task } from '@/lib/domain/types';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-blue-100 text-blue-800',
  low: 'bg-gray-100 text-gray-800'
};

export function UpcomingTasks({ tasks }: { tasks: Task[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className='text-muted-foreground py-4 text-center text-sm'>
            No upcoming tasks. You&apos;re all caught up!
          </p>
        ) : (
          <div className='space-y-3'>
            {tasks.map((task) => {
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
              return (
                <div key={task.id} className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Badge className={priorityColors[task.priority] || ''} variant='outline'>
                      {task.priority}
                    </Badge>
                    <span className={`text-sm ${isOverdue ? 'font-medium text-red-600' : ''}`}>
                      {task.title}
                    </span>
                  </div>
                  {task.dueDate && (
                    <span className={`text-xs ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}>
                      {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
