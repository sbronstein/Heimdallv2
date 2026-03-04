import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Contact } from '@/lib/domain/types';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export function FollowUpReminders({ contacts }: { contacts: Contact[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Follow-up Reminders</CardTitle>
      </CardHeader>
      <CardContent>
        {contacts.length === 0 ? (
          <p className='text-muted-foreground py-4 text-center text-sm'>
            No overdue follow-ups.
          </p>
        ) : (
          <div className='space-y-3'>
            {contacts.map((contact) => (
              <div key={contact.id} className='flex items-center justify-between'>
                <div>
                  <Link
                    href={`/dashboard/contacts/${contact.id}`}
                    className='text-sm font-medium hover:underline'
                  >
                    {contact.firstName} {contact.lastName}
                  </Link>
                  {contact.followUpNotes && (
                    <p className='text-muted-foreground text-xs truncate max-w-[200px]'>
                      {contact.followUpNotes}
                    </p>
                  )}
                </div>
                <Badge variant='destructive' className='text-xs'>
                  {contact.nextFollowUpDate
                    ? formatDistanceToNow(new Date(contact.nextFollowUpDate), {
                        addSuffix: true
                      })
                    : 'overdue'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
