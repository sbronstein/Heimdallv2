'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface InteractionFormProps {
  contactId: string;
  companyId?: string | null;
  onSuccess?: () => void;
}

export function InteractionForm({ contactId, companyId, onSuccess }: InteractionFormProps) {
  const router = useRouter();
  const [type, setType] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sentiment, setSentiment] = useState('');
  const [followUpRequired, setFollowUpRequired] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!type) {
      toast.error('Interaction type is required');
      return;
    }

    const res = await fetch('/api/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contactId,
        companyId: companyId || undefined,
        type,
        subject: subject || undefined,
        content: content || undefined,
        sentiment: sentiment || undefined,
        followUpRequired
      })
    });

    const json = await res.json();
    if (json.success) {
      toast.success('Interaction logged');
      setType('');
      setSubject('');
      setContent('');
      setSentiment('');
      setFollowUpRequired(false);
      router.refresh();
      onSuccess?.();
    } else {
      toast.error(json.error || 'Failed to log interaction');
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <Label>Type</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue placeholder='Select type' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='email_sent'>Email Sent</SelectItem>
            <SelectItem value='email_received'>Email Received</SelectItem>
            <SelectItem value='phone_call'>Phone Call</SelectItem>
            <SelectItem value='video_call'>Video Call</SelectItem>
            <SelectItem value='coffee_chat'>Coffee Chat</SelectItem>
            <SelectItem value='interview'>Interview</SelectItem>
            <SelectItem value='follow_up'>Follow Up</SelectItem>
            <SelectItem value='thank_you'>Thank You</SelectItem>
            <SelectItem value='linkedin_message_sent'>LinkedIn Message Sent</SelectItem>
            <SelectItem value='linkedin_message_received'>LinkedIn Message Received</SelectItem>
            <SelectItem value='intro_requested'>Intro Requested</SelectItem>
            <SelectItem value='intro_made'>Intro Made</SelectItem>
            <SelectItem value='informational'>Informational</SelectItem>
            <SelectItem value='other'>Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Subject</Label>
        <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder='Brief description...' />
      </div>
      <div>
        <Label>Content</Label>
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder='Details of the interaction...' rows={3} />
      </div>
      <div>
        <Label>Sentiment</Label>
        <Select value={sentiment} onValueChange={setSentiment}>
          <SelectTrigger>
            <SelectValue placeholder='How did it go?' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='very_positive'>Very Positive</SelectItem>
            <SelectItem value='positive'>Positive</SelectItem>
            <SelectItem value='neutral'>Neutral</SelectItem>
            <SelectItem value='negative'>Negative</SelectItem>
            <SelectItem value='very_negative'>Very Negative</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className='flex items-center gap-2'>
        <Switch checked={followUpRequired} onCheckedChange={setFollowUpRequired} />
        <Label>Follow-up required</Label>
      </div>
      <Button type='submit'>Log Interaction</Button>
    </form>
  );
}
