'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cva } from 'class-variance-authority';
import { useMemo } from 'react';
import { ApplicationCard } from './application-card';
import type { PipelineApplication } from '../utils/store';
import type { PipelineStage } from '@/lib/domain/types';

export interface PipelineColumnDragData {
  type: 'Column';
  column: PipelineStage;
}

interface PipelineColumnProps {
  stage: PipelineStage;
  apps: PipelineApplication[];
  isOverlay?: boolean;
  onCardClick?: (app: PipelineApplication) => void;
}

export function PipelineColumn({
  stage,
  apps,
  isOverlay,
  onCardClick
}: PipelineColumnProps) {
  const appIds = useMemo(() => apps.map((a) => a.id), [apps]);

  const {
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: stage.name,
    data: { type: 'Column', column: stage } satisfies PipelineColumnDragData,
    disabled: true // Columns are not reorderable in pipeline
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform)
  };

  const variants = cva(
    'h-[70vh] max-h-[70vh] w-[260px] max-w-full flex flex-col shrink-0',
    {
      variants: {
        dragging: {
          default: 'border-2 border-transparent',
          over: 'ring-2 opacity-30',
          overlay: 'ring-2 ring-primary'
        },
        terminal: {
          true: 'opacity-70',
          false: ''
        }
      }
    }
  );

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={variants({
        dragging: isOverlay ? 'overlay' : isDragging ? 'over' : undefined,
        terminal: stage.isTerminal ?? false
      })}
    >
      <CardHeader className='flex flex-row items-center gap-2 border-b p-3'>
        <div
          className='h-3 w-3 rounded-full'
          style={{ backgroundColor: stage.color }}
        />
        <span className='text-sm font-semibold'>{stage.displayName}</span>
        <span className='bg-muted ml-auto rounded-full px-2 py-0.5 text-xs font-medium'>
          {apps.length}
        </span>
      </CardHeader>
      <CardContent className='flex grow flex-col gap-1 overflow-hidden p-2'>
        <ScrollArea className='h-full'>
          <SortableContext items={appIds}>
            {apps.map((app) => (
              <ApplicationCard
                key={app.id}
                app={app}
                onClick={() => onCardClick?.(app)}
              />
            ))}
          </SortableContext>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
