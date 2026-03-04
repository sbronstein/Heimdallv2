import { db } from '@/lib/db';
import { pipelineStages } from '../../../../drizzle/schema';
import { asc } from 'drizzle-orm';
import { success } from '@/lib/api/types';
import { serverError } from '@/lib/api/errors';

export async function GET() {
  try {
    const stages = await db
      .select()
      .from(pipelineStages)
      .orderBy(asc(pipelineStages.displayOrder));

    return success(stages);
  } catch (err) {
    return serverError(err);
  }
}
