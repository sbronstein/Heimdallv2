import { db } from '@/lib/db';
import { contacts } from '../../../../../../drizzle/schema';
import { eq, isNull, and } from 'drizzle-orm';
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
      .from(contacts)
      .where(and(eq(contacts.companyId, id), isNull(contacts.archivedAt)));

    return success(results);
  } catch (err) {
    return serverError(err);
  }
}
