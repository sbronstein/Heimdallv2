'use client';

import { FormInput } from '@/components/forms/form-input';
import { FormSelect } from '@/components/forms/form-select';
import { FormTextarea } from '@/components/forms/form-textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import type { Company } from '@/lib/domain/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { IconChevronRight } from '@tabler/icons-react';
import { useState } from 'react';

const formSchema = z.object({
  name: z.string().min(1, 'Company name is required').max(200),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  linkedinUrl: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  industry: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  stage: z.string().optional(),
  size: z.string().optional(),
  location: z.string().optional().or(z.literal('')),
  remotePolicy: z.string().optional(),
  priority: z.string().optional(),
  tags: z.string().optional().or(z.literal('')),
  dataMaturity: z.string().optional().or(z.literal('')),
  ceoBackground: z.string().optional().or(z.literal('')),
  researchNotes: z.string().optional().or(z.literal(''))
});

type FormValues = z.infer<typeof formSchema>;

export default function CompanyForm({
  initialData,
  pageTitle
}: {
  initialData: Company | null;
  pageTitle: string;
}) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      website: initialData?.website || '',
      linkedinUrl: initialData?.linkedinUrl || '',
      industry: initialData?.industry || '',
      description: initialData?.description || '',
      stage: initialData?.stage || undefined,
      size: initialData?.size || undefined,
      location: initialData?.location || '',
      remotePolicy: initialData?.remotePolicy || undefined,
      priority: initialData?.priority || undefined,
      tags: initialData?.tags?.join(', ') || '',
      dataMaturity: initialData?.dataMaturity || '',
      ceoBackground: initialData?.ceoBackground || '',
      researchNotes: initialData?.researchNotes || ''
    }
  });

  async function onSubmit(values: FormValues) {
    const payload = {
      ...values,
      website: values.website || null,
      linkedinUrl: values.linkedinUrl || null,
      tags: values.tags
        ? values.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : null
    };

    const url = initialData
      ? `/api/companies/${initialData.id}`
      : '/api/companies';
    const method = initialData ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await res.json();

    if (json.success) {
      toast.success(
        initialData ? 'Company updated' : 'Company created'
      );
      router.push('/dashboard/companies');
      router.refresh();
    } else {
      toast.error(json.error || 'Something went wrong');
    }
  }

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>
          {pageTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form
          form={form}
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-6'
        >
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <FormInput
              control={form.control}
              name='name'
              label='Company Name'
              placeholder='e.g. Acme Corp'
              required
            />
            <FormSelect
              control={form.control}
              name='priority'
              label='Priority'
              placeholder='Select priority'
              options={[
                { label: 'Dream', value: 'dream' },
                { label: 'Strong', value: 'strong' },
                { label: 'Interested', value: 'interested' },
                { label: 'Exploring', value: 'exploring' },
                { label: 'Backburner', value: 'backburner' }
              ]}
            />
            <FormInput
              control={form.control}
              name='website'
              label='Website'
              placeholder='https://acme.com'
            />
            <FormInput
              control={form.control}
              name='linkedinUrl'
              label='LinkedIn URL'
              placeholder='https://linkedin.com/company/acme'
            />
            <FormInput
              control={form.control}
              name='industry'
              label='Industry'
              placeholder='e.g. AI/ML, FinTech'
            />
            <FormInput
              control={form.control}
              name='tags'
              label='Tags'
              placeholder='Comma-separated: boston, series-b, data-platform'
            />
          </div>

          <FormTextarea
            control={form.control}
            name='description'
            label='Description'
            placeholder='Brief company description...'
            config={{ rows: 3 }}
          />

          <Collapsible open={profileOpen} onOpenChange={setProfileOpen}>
            <CollapsibleTrigger className='flex w-full items-center gap-2 rounded-lg border p-3 font-medium'>
              <IconChevronRight
                className={`h-4 w-4 transition-transform ${profileOpen ? 'rotate-90' : ''}`}
              />
              Company Profile
            </CollapsibleTrigger>
            <CollapsibleContent className='mt-3 space-y-4'>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <FormSelect
                  control={form.control}
                  name='stage'
                  label='Funding Stage'
                  placeholder='Select stage'
                  options={[
                    { label: 'Seed', value: 'seed' },
                    { label: 'Series A', value: 'series_a' },
                    { label: 'Series B', value: 'series_b' },
                    { label: 'Series C', value: 'series_c' },
                    { label: 'Series D+', value: 'series_d_plus' },
                    { label: 'Growth', value: 'growth' },
                    { label: 'Public', value: 'public' },
                    { label: 'Bootstrapped', value: 'bootstrapped' }
                  ]}
                />
                <FormSelect
                  control={form.control}
                  name='size'
                  label='Company Size'
                  placeholder='Select size'
                  options={[
                    { label: '1-10', value: '1_10' },
                    { label: '11-50', value: '11_50' },
                    { label: '51-100', value: '51_100' },
                    { label: '101-250', value: '101_250' },
                    { label: '251-500', value: '251_500' },
                    { label: '501-1000', value: '501_1000' },
                    { label: '1001-5000', value: '1001_5000' },
                    { label: '5001+', value: '5001_plus' }
                  ]}
                />
                <FormInput
                  control={form.control}
                  name='location'
                  label='Location'
                  placeholder='e.g. San Francisco, CA'
                />
                <FormSelect
                  control={form.control}
                  name='remotePolicy'
                  label='Remote Policy'
                  placeholder='Select policy'
                  options={[
                    { label: 'Remote', value: 'remote' },
                    { label: 'Hybrid', value: 'hybrid' },
                    { label: 'Onsite', value: 'onsite' },
                    { label: 'Flexible', value: 'flexible' }
                  ]}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={assessmentOpen} onOpenChange={setAssessmentOpen}>
            <CollapsibleTrigger className='flex w-full items-center gap-2 rounded-lg border p-3 font-medium'>
              <IconChevronRight
                className={`h-4 w-4 transition-transform ${assessmentOpen ? 'rotate-90' : ''}`}
              />
              Assessment
            </CollapsibleTrigger>
            <CollapsibleContent className='mt-3 space-y-4'>
              <FormInput
                control={form.control}
                name='dataMaturity'
                label='Data Maturity'
                placeholder='e.g. Early, Established, Advanced'
              />
              <FormTextarea
                control={form.control}
                name='ceoBackground'
                label='CEO Background'
                placeholder='CEO background and leadership notes...'
                config={{ rows: 3 }}
              />
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={notesOpen} onOpenChange={setNotesOpen}>
            <CollapsibleTrigger className='flex w-full items-center gap-2 rounded-lg border p-3 font-medium'>
              <IconChevronRight
                className={`h-4 w-4 transition-transform ${notesOpen ? 'rotate-90' : ''}`}
              />
              Research Notes
            </CollapsibleTrigger>
            <CollapsibleContent className='mt-3'>
              <FormTextarea
                control={form.control}
                name='researchNotes'
                label='Research Notes'
                placeholder='Company research, notes, observations...'
                config={{ rows: 6 }}
              />
            </CollapsibleContent>
          </Collapsible>

          <Button type='submit'>
            {initialData ? 'Update Company' : 'Add Company'}
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
}
