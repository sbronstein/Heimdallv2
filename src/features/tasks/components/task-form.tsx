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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface TaskFormProps {
  onSuccess?: () => void;
  compact?: boolean;
  defaultCompanyId?: string;
  defaultContactId?: string;
  defaultApplicationId?: string;
}

export function TaskForm({
  onSuccess,
  compact,
  defaultCompanyId,
  defaultContactId,
  defaultApplicationId
}: TaskFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description: description || undefined,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        companyId: defaultCompanyId || undefined,
        contactId: defaultContactId || undefined,
        applicationId: defaultApplicationId || undefined
      })
    });

    const json = await res.json();
    if (json.success) {
      toast.success('Task created');
      setTitle('');
      setDescription('');
      setDueDate('');
      router.refresh();
      onSuccess?.();
    } else {
      toast.error(json.error || 'Failed to create task');
    }
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className='flex gap-2'>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='Add a task...'
          className='flex-1'
        />
        <Button type='submit' size='sm'>Add</Button>
      </form>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Task</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder='What needs to be done?' />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder='Details...' rows={3} />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='urgent'>Urgent</SelectItem>
                  <SelectItem value='high'>High</SelectItem>
                  <SelectItem value='medium'>Medium</SelectItem>
                  <SelectItem value='low'>Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Due Date</Label>
              <Input type='date' value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
          <Button type='submit'>Create Task</Button>
        </form>
      </CardContent>
    </Card>
  );
}
