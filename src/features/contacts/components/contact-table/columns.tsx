'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Contact } from '@/lib/domain/types';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Text } from 'lucide-react';
import { CellAction } from './cell-action';
import { WARMTH_OPTIONS, RELATIONSHIP_OPTIONS } from './options';
import { formatDistanceToNow } from 'date-fns';

const warmthColors: Record<string, string> = {
  hot: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  warm: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  lukewarm: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  cold: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
};

export const columns: ColumnDef<Contact>[] = [
  {
    id: 'name',
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    header: ({ column }: { column: Column<Contact, unknown> }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => (
      <div className='font-medium'>
        {row.original.firstName} {row.original.lastName}
      </div>
    ),
    meta: {
      label: 'Name',
      placeholder: 'Search contacts...',
      variant: 'text',
      icon: Text
    },
    enableColumnFilter: true
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ cell }) => <div>{cell.getValue<string>() || '-'}</div>
  },
  {
    accessorKey: 'currentCompany',
    header: 'Company',
    cell: ({ cell }) => <div>{cell.getValue<string>() || '-'}</div>
  },
  {
    id: 'relationship',
    accessorKey: 'relationship',
    header: ({ column }: { column: Column<Contact, unknown> }) => (
      <DataTableColumnHeader column={column} title='Relationship' />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue<string>();
      const label = RELATIONSHIP_OPTIONS.find((o) => o.value === value)?.label || value;
      return <Badge variant='outline'>{label}</Badge>;
    },
    enableColumnFilter: true,
    meta: {
      label: 'Relationship',
      variant: 'multiSelect',
      options: RELATIONSHIP_OPTIONS
    }
  },
  {
    id: 'warmth',
    accessorKey: 'warmth',
    header: ({ column }: { column: Column<Contact, unknown> }) => (
      <DataTableColumnHeader column={column} title='Warmth' />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue<string>();
      return (
        <Badge className={warmthColors[value] || ''} variant='outline'>
          {value}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Warmth',
      variant: 'multiSelect',
      options: WARMTH_OPTIONS
    }
  },
  {
    accessorKey: 'nextFollowUpDate',
    header: 'Follow Up',
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
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
