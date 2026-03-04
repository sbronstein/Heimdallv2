'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Company } from '@/lib/domain/types';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Text } from 'lucide-react';
import { CellAction } from './cell-action';
import { PRIORITY_OPTIONS, STAGE_OPTIONS } from './options';

const priorityColors: Record<string, string> = {
  dream: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  strong: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  interested:
    'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
  exploring: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  backburner: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

export const columns: ColumnDef<Company>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<Company, unknown> }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ cell }) => (
      <div className='font-medium'>{cell.getValue<string>()}</div>
    ),
    meta: {
      label: 'Name',
      placeholder: 'Search companies...',
      variant: 'text',
      icon: Text
    },
    enableColumnFilter: true
  },
  {
    id: 'priority',
    accessorKey: 'priority',
    header: ({ column }: { column: Column<Company, unknown> }) => (
      <DataTableColumnHeader column={column} title='Priority' />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue<string>();
      const colorClass = priorityColors[value] || '';
      return (
        <Badge variant='outline' className={`capitalize ${colorClass}`}>
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
    id: 'stage',
    accessorKey: 'stage',
    header: ({ column }: { column: Column<Company, unknown> }) => (
      <DataTableColumnHeader column={column} title='Stage' />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue<string>();
      const label =
        STAGE_OPTIONS.find((o) => o.value === value)?.label || value;
      return (
        <Badge variant='outline' className='capitalize'>
          {label}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Stage',
      variant: 'multiSelect',
      options: STAGE_OPTIONS
    }
  },
  {
    accessorKey: 'industry',
    header: ({ column }: { column: Column<Company, unknown> }) => (
      <DataTableColumnHeader column={column} title='Industry' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<string>() || '-'}</div>
  },
  {
    accessorKey: 'location',
    header: ({ column }: { column: Column<Company, unknown> }) => (
      <DataTableColumnHeader column={column} title='Location' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<string>() || '-'}</div>
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ cell }) => {
      const value = cell.getValue<string>();
      return (
        <Badge variant={value === 'active' ? 'default' : 'secondary'}>
          {value || 'active'}
        </Badge>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
