'use client';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Task } from '@/lib/domain/types';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Text } from 'lucide-react';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from './options';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-blue-100 text-blue-800',
  low: 'bg-gray-100 text-gray-800'
};

function TaskCheckbox({ task }: { task: Task }) {
  const router = useRouter();
  const isDone = task.status === 'done';

  async function toggle() {
    const newStatus = isDone ? 'todo' : 'done';
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    const json = await res.json();
    if (json.success) {
      toast.success(newStatus === 'done' ? 'Task completed' : 'Task reopened');
      router.refresh();
    }
  }

  return (
    <Checkbox
      checked={isDone}
      onCheckedChange={toggle}
      aria-label={isDone ? 'Mark as todo' : 'Mark as done'}
    />
  );
}

export const columns: ColumnDef<Task>[] = [
  {
    id: 'done',
    cell: ({ row }) => <TaskCheckbox task={row.original} />,
    enableSorting: false
  },
  {
    id: 'title',
    accessorKey: 'title',
    header: ({ column }: { column: Column<Task, unknown> }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    cell: ({ row }) => {
      const isDone = row.original.status === 'done';
      return (
        <div className={isDone ? 'line-through opacity-50' : 'font-medium'}>
          {row.original.title}
        </div>
      );
    },
    meta: {
      label: 'Title',
      placeholder: 'Search tasks...',
      variant: 'text',
      icon: Text
    },
    enableColumnFilter: true
  },
  {
    id: 'priority',
    accessorKey: 'priority',
    header: ({ column }: { column: Column<Task, unknown> }) => (
      <DataTableColumnHeader column={column} title='Priority' />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue<string>();
      return (
        <Badge className={priorityColors[value] || ''} variant='outline'>
          {value}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Priority',
      variant: 'multiSelect',
      options: PRIORITY_OPTIONS
    }
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }: { column: Column<Task, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue<string>();
      const label = STATUS_OPTIONS.find((o) => o.value === value)?.label || value;
      return <Badge variant='outline'>{label}</Badge>;
    },
    enableColumnFilter: true,
    meta: {
      label: 'Status',
      variant: 'multiSelect',
      options: STATUS_OPTIONS
    }
  },
  {
    accessorKey: 'dueDate',
    header: 'Due',
    cell: ({ cell }) => {
      const date = cell.getValue<Date | null>();
      if (!date) return <span className='text-muted-foreground'>-</span>;
      const isOverdue = new Date(date) < new Date();
      return (
        <span className={isOverdue ? 'font-medium text-red-600' : ''}>
          {formatDistanceToNow(new Date(date), { addSuffix: true })}
        </span>
      );
    }
  }
];
