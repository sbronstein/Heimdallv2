'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { PipelineColumn } from './pipeline-column';
import { ApplicationCard } from './application-card';
import { usePipelineStore, type PipelineApplication } from '../utils/store';
import { canTransition } from '@/lib/domain/pipeline';
import type { PipelineStage } from '@/lib/domain/types';

interface PipelineBoardProps {
  stages: PipelineStage[];
  initialApplications: PipelineApplication[];
  onCardClick?: (app: PipelineApplication) => void;
}

export function PipelineBoard({
  stages,
  initialApplications,
  onCardClick
}: PipelineBoardProps) {
  const applications = usePipelineStore((s) => s.applications);
  const setApplications = usePipelineStore((s) => s.setApplications);
  const moveApplication = usePipelineStore((s) => s.moveApplication);

  const [activeApp, setActiveApp] = useState<PipelineApplication | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  const stageNames = useMemo(() => stages.map((s) => s.name), [stages]);

  useEffect(() => {
    setApplications(initialApplications);
    setIsMounted(true);
  }, [initialApplications, setApplications]);

  if (!isMounted) return null;

  function onDragStart(event: DragStartEvent) {
    const data = event.active.data.current;
    if (data?.type === 'App') {
      setActiveApp(data.app);
    }
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type !== 'App') return;

    let newStatus: string | null = null;

    if (overData?.type === 'App') {
      newStatus = overData.app.status;
    } else if (overData?.type === 'Column') {
      newStatus = overData.column.name;
    }

    if (!newStatus) return;
    const currentApp = applications.find((a) => a.id === active.id);
    if (!currentApp || currentApp.status === newStatus) return;

    // Optimistic move during drag
    moveApplication(currentApp.id, newStatus);
  }

  async function onDragEnd(event: DragEndEvent) {
    setActiveApp(null);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    if (activeData?.type !== 'App') return;

    const overData = over.data.current;
    let newStatus: string | null = null;

    if (overData?.type === 'App') {
      newStatus = overData.app.status;
    } else if (overData?.type === 'Column') {
      newStatus = overData.column.name;
    }

    if (!newStatus) return;

    const originalApp = initialApplications.find((a) => a.id === active.id);
    if (!originalApp) return;

    if (originalApp.status === newStatus) return;

    // Validate transition
    if (!canTransition(originalApp.status, newStatus)) {
      toast.error(
        `Invalid transition: ${originalApp.status.replace(/_/g, ' ')} -> ${newStatus.replace(/_/g, ' ')}`
      );
      // Revert
      setApplications(initialApplications);
      return;
    }

    // Persist to API
    try {
      const res = await fetch(`/api/applications/${originalApp.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || 'Failed to update status');
        setApplications(initialApplications);
      } else {
        toast.success(
          `Moved to ${newStatus.replace(/_/g, ' ')}`
        );
      }
    } catch {
      toast.error('Failed to update status');
      setApplications(initialApplications);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <ScrollArea className='w-full whitespace-nowrap rounded-md'>
        <div className='flex gap-4 px-2 pb-4'>
          <SortableContext items={stageNames}>
            {stages.map((stage) => (
              <PipelineColumn
                key={stage.name}
                stage={stage}
                apps={applications.filter((a) => a.status === stage.name)}
                onCardClick={onCardClick}
              />
            ))}
          </SortableContext>
        </div>
        <ScrollBar orientation='horizontal' />
      </ScrollArea>
      {'document' in globalThis &&
        createPortal(
          <DragOverlay>
            {activeApp && <ApplicationCard app={activeApp} isOverlay />}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  );
}
