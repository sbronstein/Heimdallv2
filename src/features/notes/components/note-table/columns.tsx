'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Note } from '@/lib/domain/types';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Text } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { IconEye, IconTrash, IconDotsVertical } from '@tabler/icons-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

function NoteCellAction({ data }: { data: Note }) {
  const router = useRouter();

  async function handleArchive() {
    await fetch(`/api/notes/${data.id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <IconDotsVertical className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => router.push(`/dashboard/notes/${data.id}`)}>
          <IconEye className='mr-2 h-4 w-4' /> View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleArchive}>
          <IconTrash className='mr-2 h-4 w-4' /> Archive
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const CATEGORY_OPTIONS = [
  { value: 'research', label: 'Research' },
  { value: 'interview_prep', label: 'Interview Prep' },
  { value: 'star_story', label: 'STAR Story' },
  { value: 'weekly_reflection', label: 'Weekly Reflection' },
  { value: 'strategy', label: 'Strategy' },
  { value: 'general', label: 'General' }
];

export const columns: ColumnDef<Note>[] = [
  {
    id: 'title',
    accessorKey: 'title',
    header: ({ column }: { column: Column<Note, unknown> }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    cell: ({ cell }) => <div className='font-medium'>{cell.getValue<string>()}</div>,
    meta: {
      label: 'Title',
      placeholder: 'Search notes...',
      variant: 'text',
      icon: Text
    },
    enableColumnFilter: true
  },
  {
    id: 'category',
    accessorKey: 'category',
    header: 'Category',
    cell: ({ cell }) => {
      const value = cell.getValue<string>();
      const label = CATEGORY_OPTIONS.find((o) => o.value === value)?.label || value;
      return value ? <Badge variant='outline'>{label}</Badge> : <span className='text-muted-foreground'>-</span>;
    },
    enableColumnFilter: true,
    meta: {
      label: 'Category',
      variant: 'multiSelect',
      options: CATEGORY_OPTIONS
    }
  },
  {
    accessorKey: 'content',
    header: 'Preview',
    cell: ({ cell }) => (
      <div className='text-muted-foreground max-w-[300px] truncate text-sm'>
        {cell.getValue<string>()?.slice(0, 100)}
      </div>
    )
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated',
    cell: ({ cell }) => {
      const date = cell.getValue<Date>();
      return (
        <span className='text-muted-foreground text-sm'>
          {formatDistanceToNow(new Date(date), { addSuffix: true })}
        </span>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <NoteCellAction data={row.original} />
  }
];
