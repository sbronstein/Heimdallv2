import { db } from '@/lib/db';
import { interactions } from '../../../../../../drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { success } from '@/lib/api/types';
import { serverError } from '@/lib/api/errors';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const results = await db
      .select()
      .from(interactions)
      .where(eq(interactions.contactId, id))
      .orderBy(desc(interactions.occurredAt));

    return success(results);
  } catch (err) {
    return serverError(err);
  }
}
