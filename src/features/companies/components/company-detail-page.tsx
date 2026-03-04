'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Company, Contact, Application } from '@/lib/domain/types';
import { IconExternalLink, IconEdit } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const priorityColors: Record<string, string> = {
  dream: 'bg-emerald-100 text-emerald-800',
  strong: 'bg-blue-100 text-blue-800',
  interested: 'bg-violet-100 text-violet-800',
  exploring: 'bg-gray-100 text-gray-800',
  backburner: 'bg-red-100 text-red-800'
};

export default function CompanyDetailPage({
  company,
  contacts,
  applications
}: {
  company: Company;
  contacts: Contact[];
  applications: Application[];
}) {
  const router = useRouter();

  return (
    <div className='space-y-6'>
      <div className='flex items-start justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>{company.name}</h1>
          <div className='mt-2 flex items-center gap-2'>
            {company.priority && (
              <Badge className={priorityColors[company.priority] || ''}>
                {company.priority}
              </Badge>
            )}
            {company.stage && company.stage !== 'unknown' && (
              <Badge variant='outline'>{company.stage.replace('_', ' ')}</Badge>
            )}
            {company.industry && (
              <Badge variant='secondary'>{company.industry}</Badge>
            )}
          </div>
        </div>
        <div className='flex gap-2'>
          {company.website && (
            <Button variant='outline' size='sm' asChild>
              <a href={company.website} target='_blank' rel='noopener'>
                <IconExternalLink className='mr-1 h-4 w-4' /> Website
              </a>
            </Button>
          )}
          <Button
            variant='outline'
            size='sm'
            onClick={() =>
              router.push(`/dashboard/companies/${company.id}?edit=true`)
            }
          >
            <IconEdit className='mr-1 h-4 w-4' /> Edit
          </Button>
        </div>
      </div>

      <Tabs defaultValue='overview'>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='contacts'>
            Contacts ({contacts.length})
          </TabsTrigger>
          <TabsTrigger value='applications'>
            Applications ({applications.length})
          </TabsTrigger>
          <TabsTrigger value='notes'>Notes</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          {company.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground'>{company.description}</p>
              </CardContent>
            </Card>
          )}

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Company Profile</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                <DetailRow label='Location' value={company.location} />
                <DetailRow
                  label='Size'
                  value={company.size?.replace('_', '-')}
                />
                <DetailRow
                  label='Remote Policy'
                  value={company.remotePolicy}
                />
                <DetailRow label='Data Maturity' value={company.dataMaturity} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                {company.tags && company.tags.length > 0 ? (
                  <div className='flex flex-wrap gap-1'>
                    {company.tags.map((tag) => (
                      <Badge key={tag} variant='secondary'>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className='text-muted-foreground text-sm'>
                    No tags added
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {company.researchNotes && (
            <Card>
              <CardHeader>
                <CardTitle>Research Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground whitespace-pre-wrap'>
                  {company.researchNotes}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value='contacts'>
          {contacts.length === 0 ? (
            <Card>
              <CardContent className='py-8 text-center'>
                <p className='text-muted-foreground'>
                  No contacts linked to this company yet.
                </p>
                <Button variant='outline' className='mt-4' asChild>
                  <Link href='/dashboard/contacts?new=true'>Add Contact</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className='space-y-2'>
              {contacts.map((contact) => (
                <Card key={contact.id}>
                  <CardContent className='flex items-center justify-between py-3'>
                    <div>
                      <Link
                        href={`/dashboard/contacts/${contact.id}`}
                        className='font-medium hover:underline'
                      >
                        {contact.firstName} {contact.lastName}
                      </Link>
                      <p className='text-muted-foreground text-sm'>
                        {contact.title} &middot;{' '}
                        {contact.relationship?.replace('_', ' ')}
                      </p>
                    </div>
                    {contact.warmth && (
                      <Badge variant='outline'>{contact.warmth}</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value='applications'>
          {applications.length === 0 ? (
            <Card>
              <CardContent className='py-8 text-center'>
                <p className='text-muted-foreground'>
                  No applications for this company yet.
                </p>
                <Button variant='outline' className='mt-4' asChild>
                  <Link href='/dashboard/pipeline'>Go to Pipeline</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className='space-y-2'>
              {applications.map((app) => (
                <Card key={app.id}>
                  <CardContent className='flex items-center justify-between py-3'>
                    <div>
                      <p className='font-medium'>{app.roleTitle}</p>
                      <p className='text-muted-foreground text-sm'>
                        {app.status.replace('_', ' ')}
                      </p>
                    </div>
                    {app.excitementLevel && (
                      <Badge variant='outline'>
                        {app.excitementLevel.replace('_', ' ')}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value='notes'>
          <Card>
            <CardContent className='py-8 text-center'>
              <p className='text-muted-foreground'>
                Notes for this company will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DetailRow({
  label,
  value
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className='flex justify-between'>
      <span className='text-muted-foreground text-sm'>{label}</span>
      <span className='text-sm font-medium'>{value || '-'}</span>
    </div>
  );
}
