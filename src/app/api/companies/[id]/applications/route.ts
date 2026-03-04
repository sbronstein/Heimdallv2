import { db } from '@/lib/db';
import { applications } from '../../../../../../drizzle/schema';
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
      .from(applications)
      .where(
        and(eq(applications.companyId, id), isNull(applications.archivedAt))
      );

    return success(results);
  } catch (err) {
    return serverError(err);
  }
}
