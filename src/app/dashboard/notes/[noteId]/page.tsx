import PageContainer from '@/components/layout/page-container';
import { db } from '@/lib/db';
import { notes } from '../../../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import NoteForm from '@/features/notes/components/note-form';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { IconEdit } from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';

type Props = {
  params: Promise<{ noteId: string }>;
  searchParams: Promise<{ edit?: string }>;
};

export default async function NotePage({ params, searchParams }: Props) {
  const { noteId } = await params;
  const { edit } = await searchParams;

  if (noteId === 'new') {
    return (
      <PageContainer pageTitle='New Note' pageDescription='Create a new note.'>
        <NoteForm initialData={null} pageTitle='Create New Note' />
      </PageContainer>
    );
  }

  const [note] = await db.select().from(notes).where(eq(notes.id, noteId));
  if (!note) notFound();

  if (edit === 'true') {
    return (
      <PageContainer pageTitle='Edit Note' pageDescription={`Editing: ${note.title}`}>
        <NoteForm initialData={note} pageTitle={`Edit: ${note.title}`} />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      pageTitle={note.title}
      pageDescription={`Updated ${formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}`}
      pageHeaderAction={
        <Button variant='outline' size='sm' asChild>
          <Link href={`/dashboard/notes/${note.id}?edit=true`}>
            <IconEdit className='mr-1 h-4 w-4' /> Edit
          </Link>
        </Button>
      }
    >
      <div className='space-y-4'>
        {(note.category || (note.tags && note.tags.length > 0)) && (
          <div className='flex flex-wrap gap-2'>
            {note.category && <Badge>{note.category.replace('_', ' ')}</Badge>}
            {note.tags?.map((tag) => (
              <Badge key={tag} variant='secondary'>{tag}</Badge>
            ))}
          </div>
        )}
        <Card>
          <CardContent className='prose dark:prose-invert max-w-none pt-6'>
            <pre className='whitespace-pre-wrap font-sans'>{note.content}</pre>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
