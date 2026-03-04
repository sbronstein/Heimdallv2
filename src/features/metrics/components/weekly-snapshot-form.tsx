'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface WeeklySnapshotFormProps {
  onSaved: (metric: any) => void;
}

export function WeeklySnapshotForm({ onSaved }: WeeklySnapshotFormProps) {
  const [loading, setLoading] = useState(false);
  const [autoPopulated, setAutoPopulated] = useState(false);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStartStr = weekStart.toISOString().split('T')[0];

  const [form, setForm] = useState({
    weekStarting: weekStartStr,
    applicationsSubmitted: '',
    networkingConversations: '',
    interviewsCompleted: '',
    followUpsSent: '',
    newCompaniesResearched: '',
    newContactsAdded: '',
    activeApplications: '',
    offersReceived: '',
    rejections: '',
    energyLevel: '',
    weeklyReflection: '',
    jscNotes: ''
  });

  const handleAutoPopulate = async () => {
    try {
      const res = await fetch('/api/metrics?auto_populate=true');
      const json = await res.json();
      if (json.success) {
        const d = json.data;
        setForm((prev) => ({
          ...prev,
          activeApplications: String(d.activeApplications ?? ''),
          newCompaniesResearched: String(d.newCompaniesResearched ?? ''),
          newContactsAdded: String(d.newContactsAdded ?? ''),
          interviewsCompleted: String(d.interviewsCompleted ?? ''),
          offersReceived: String(d.offersReceived ?? ''),
          rejections: String(d.rejections ?? '')
        }));
        setAutoPopulated(true);
        toast.success('Auto-populated from system data');
      }
    } catch {
      toast.error('Failed to auto-populate');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload: Record<string, unknown> = {
      weekStarting: form.weekStarting
    };

    // Only include numeric fields that have values
    const numericFields = [
      'applicationsSubmitted',
      'networkingConversations',
      'interviewsCompleted',
      'followUpsSent',
      'newCompaniesResearched',
      'newContactsAdded',
      'activeApplications',
      'offersReceived',
      'rejections',
      'energyLevel'
    ] as const;

    for (const field of numericFields) {
      const val = form[field];
      if (val !== '') {
        payload[field] = parseInt(val, 10);
      }
    }

    if (form.weeklyReflection) payload.weeklyReflection = form.weeklyReflection;
    if (form.jscNotes) payload.jscNotes = form.jscNotes;

    try {
      const res = await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Weekly metrics saved');
        onSaved(json.data);
        // Reset form
        setForm({
          weekStarting: weekStartStr,
          applicationsSubmitted: '',
          networkingConversations: '',
          interviewsCompleted: '',
          followUpsSent: '',
          newCompaniesResearched: '',
          newContactsAdded: '',
          activeApplications: '',
          offersReceived: '',
          rejections: '',
          energyLevel: '',
          weeklyReflection: '',
          jscNotes: ''
        });
        setAutoPopulated(false);
      } else {
        toast.error(json.error || 'Failed to save');
      }
    } catch {
      toast.error('Failed to save metrics');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Record Weekly Snapshot</CardTitle>
            <CardDescription>
              Track your job search activity for JSC reporting
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAutoPopulate}
            type="button"
          >
            Auto-populate
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            <div>
              <Label htmlFor="applicationsSubmitted">Apps Submitted</Label>
              <Input
                id="applicationsSubmitted"
                type="number"
                min="0"
                value={form.applicationsSubmitted}
                onChange={(e) =>
                  updateField('applicationsSubmitted', e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="networkingConversations">
                Networking Convos
              </Label>
              <Input
                id="networkingConversations"
                type="number"
                min="0"
                value={form.networkingConversations}
                onChange={(e) =>
                  updateField('networkingConversations', e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="interviewsCompleted">Interviews</Label>
              <Input
                id="interviewsCompleted"
                type="number"
                min="0"
                value={form.interviewsCompleted}
                onChange={(e) =>
                  updateField('interviewsCompleted', e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="followUpsSent">Follow-ups Sent</Label>
              <Input
                id="followUpsSent"
                type="number"
                min="0"
                value={form.followUpsSent}
                onChange={(e) => updateField('followUpsSent', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="energyLevel">Energy (1-10)</Label>
              <Input
                id="energyLevel"
                type="number"
                min="1"
                max="10"
                value={form.energyLevel}
                onChange={(e) => updateField('energyLevel', e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="newCompaniesResearched">New Companies</Label>
              <Input
                id="newCompaniesResearched"
                type="number"
                min="0"
                value={form.newCompaniesResearched}
                onChange={(e) =>
                  updateField('newCompaniesResearched', e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="newContactsAdded">New Contacts</Label>
              <Input
                id="newContactsAdded"
                type="number"
                min="0"
                value={form.newContactsAdded}
                onChange={(e) =>
                  updateField('newContactsAdded', e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="activeApplications">Active Pipeline</Label>
              <Input
                id="activeApplications"
                type="number"
                min="0"
                value={form.activeApplications}
                onChange={(e) =>
                  updateField('activeApplications', e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="offersReceived">Offers / Rejections</Label>
              <div className="flex gap-2">
                <Input
                  id="offersReceived"
                  type="number"
                  min="0"
                  placeholder="Offers"
                  value={form.offersReceived}
                  onChange={(e) =>
                    updateField('offersReceived', e.target.value)
                  }
                />
                <Input
                  type="number"
                  min="0"
                  placeholder="Rej."
                  value={form.rejections}
                  onChange={(e) => updateField('rejections', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="weeklyReflection">Weekly Reflection</Label>
            <Textarea
              id="weeklyReflection"
              placeholder="How did the week go? Key wins, lessons learned..."
              value={form.weeklyReflection}
              onChange={(e) => updateField('weeklyReflection', e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="jscNotes">JSC Notes</Label>
            <Textarea
              id="jscNotes"
              placeholder="Notes for your Job Search Council meeting..."
              value={form.jscNotes}
              onChange={(e) => updateField('jscNotes', e.target.value)}
              rows={2}
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Weekly Snapshot'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
