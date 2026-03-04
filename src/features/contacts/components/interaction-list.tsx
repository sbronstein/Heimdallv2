import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Interaction } from '@/lib/domain/types';
import { formatDistanceToNow } from 'date-fns';

const sentimentColors: Record<string, string> = {
  very_positive: 'bg-emerald-100 text-emerald-800',
  positive: 'bg-green-100 text-green-800',
  neutral: 'bg-gray-100 text-gray-800',
  negative: 'bg-orange-100 text-orange-800',
  very_negative: 'bg-red-100 text-red-800'
};

export function InteractionList({ interactions }: { interactions: Interaction[] }) {
  if (interactions.length === 0) {
    return (
      <p className='text-muted-foreground py-8 text-center text-sm'>
        No interactions logged yet.
      </p>
    );
  }

  return (
    <div className='space-y-3'>
      {interactions.map((interaction) => (
        <Card key={interaction.id}>
          <CardContent className='py-3'>
            <div className='flex items-start justify-between'>
              <div>
                <div className='flex items-center gap-2'>
                  <Badge variant='outline' className='capitalize'>
                    {interaction.type.replace(/_/g, ' ')}
                  </Badge>
                  {interaction.sentiment && (
                    <Badge className={sentimentColors[interaction.sentiment] || ''} variant='outline'>
                      {interaction.sentiment.replace(/_/g, ' ')}
                    </Badge>
                  )}
                </div>
                {interaction.subject && (
                  <p className='mt-1 font-medium'>{interaction.subject}</p>
                )}
                {interaction.content && (
                  <p className='text-muted-foreground mt-1 text-sm line-clamp-2'>
                    {interaction.content}
                  </p>
                )}
              </div>
              <span className='text-muted-foreground text-xs whitespace-nowrap'>
                {formatDistanceToNow(new Date(interaction.occurredAt), { addSuffix: true })}
              </span>
            </div>
            {interaction.followUpRequired && !interaction.followUpCompleted && (
              <Badge variant='destructive' className='mt-2 text-xs'>
                Follow-up needed
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
