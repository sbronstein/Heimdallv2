import { db } from '@/lib/db';
import { companies, contacts, applications, notes } from '../../../../drizzle/schema';
import { ilike, isNull, sql, desc, eq } from 'drizzle-orm';
import { success } from '@/lib/api/types';
import { serverError } from '@/lib/api/errors';
import { parseLimit } from '@/lib/api/filters';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const limit = parseLimit(searchParams.get('limit'), 10);

    if (!q || q.trim().length < 2) {
      return success({ companies: [], contacts: [], applications: [], notes: [] });
    }

    const term = `%${q.trim()}%`;

    const [companyResults, contactResults, applicationResults, noteResults] =
      await Promise.all([
        db
          .select({
            id: companies.id,
            name: companies.name,
            industry: companies.industry,
            priority: companies.priority
          })
          .from(companies)
          .where(
            sql`${isNull(companies.archivedAt)} AND (${ilike(companies.name, term)} OR ${ilike(companies.industry, term)})`
          )
          .orderBy(desc(companies.updatedAt))
          .limit(limit),
        db
          .select({
            id: contacts.id,
            name: sql<string>`concat(${contacts.firstName}, ' ', ${contacts.lastName})`,
            title: contacts.title,
            company: contacts.currentCompany
          })
          .from(contacts)
          .where(
            sql`${isNull(contacts.archivedAt)} AND (${ilike(contacts.firstName, term)} OR ${ilike(contacts.lastName, term)} OR ${ilike(contacts.title, term)} OR ${ilike(contacts.currentCompany, term)})`
          )
          .orderBy(desc(contacts.updatedAt))
          .limit(limit),
        db
          .select({
            id: applications.id,
            roleTitle: applications.roleTitle,
            companyName: companies.name,
            status: applications.status
          })
          .from(applications)
          .leftJoin(companies, eq(applications.companyId, companies.id))
          .where(
            sql`${isNull(applications.archivedAt)} AND (${ilike(applications.roleTitle, term)} OR ${ilike(companies.name, term)})`
          )
          .orderBy(desc(applications.updatedAt))
          .limit(limit),
        db
          .select({
            id: notes.id,
            title: notes.title,
            category: notes.category
          })
          .from(notes)
          .where(
            sql`${isNull(notes.archivedAt)} AND (${ilike(notes.title, term)} OR ${ilike(notes.content, term)})`
          )
          .orderBy(desc(notes.updatedAt))
          .limit(limit)
      ]);

    return success({
      companies: companyResults,
      contacts: contactResults,
      applications: applicationResults,
      notes: noteResults
    });
  } catch (err) {
    return serverError(err);
  }
}
