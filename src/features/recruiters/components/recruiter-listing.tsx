'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  IconStar,
  IconStarFilled,
  IconTrash,
  IconExternalLink
} from '@tabler/icons-react';
import { toast } from 'sonner';

type RecruiterRow = {
  id: string;
  contactId: string;
  firm: string | null;
  specialty: string | null;
  region: string | null;
  engagementStatus: string | null;
  lastSubmittedTo: string | null;
  qualityRating: number | null;
  notes: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactTitle: string | null;
};

interface RecruiterListingProps {
  recruiters: RecruiterRow[];
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  paused: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
};

export function RecruiterListing({
  recruiters: initialRecruiters
}: RecruiterListingProps) {
  const [recruiters, setRecruiters] = useState(initialRecruiters);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/recruiters/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setRecruiters((prev) => prev.filter((r) => r.id !== id));
        toast.success('Recruiter removed');
      }
    } catch {
      toast.error('Failed to remove recruiter');
    }
  };

  if (recruiters.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground text-sm">
            No recruiters tracked yet. Add a recruiter profile to a contact to
            start tracking.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {recruiters.map((r) => (
        <Card key={r.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base">
                  {r.contactName || 'Unknown Contact'}
                </CardTitle>
                <CardDescription>
                  {r.firm && <span>{r.firm}</span>}
                  {r.firm && r.contactTitle && <span> · </span>}
                  {r.contactTitle && <span>{r.contactTitle}</span>}
                </CardDescription>
              </div>
              <div className="flex items-center gap-1">
                {r.engagementStatus && (
                  <Badge
                    className={
                      statusColors[r.engagementStatus] || statusColors.new
                    }
                  >
                    {r.engagementStatus}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {r.specialty && (
              <div className="text-sm">
                <span className="text-muted-foreground">Specialty:</span>{' '}
                {r.specialty}
              </div>
            )}
            {r.region && (
              <div className="text-sm">
                <span className="text-muted-foreground">Region:</span>{' '}
                {r.region}
              </div>
            )}
            {r.lastSubmittedTo && (
              <div className="text-sm">
                <span className="text-muted-foreground">Last submitted:</span>{' '}
                {r.lastSubmittedTo}
              </div>
            )}
            {r.qualityRating && (
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) =>
                  i < r.qualityRating! ? (
                    <IconStarFilled
                      key={i}
                      className="h-3.5 w-3.5 text-amber-500"
                    />
                  ) : (
                    <IconStar
                      key={i}
                      className="text-muted-foreground h-3.5 w-3.5"
                    />
                  )
                )}
              </div>
            )}
            {r.notes && (
              <p className="text-muted-foreground line-clamp-2 text-xs">
                {r.notes}
              </p>
            )}
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                asChild
              >
                <a href={`/dashboard/contacts/${r.contactId}`}>
                  <IconExternalLink className="mr-1 h-3.5 w-3.5" />
                  View Contact
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => handleDelete(r.id)}
              >
                <IconTrash className="mr-1 h-3.5 w-3.5" />
                Remove
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
