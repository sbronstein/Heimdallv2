import PageContainer from '@/components/layout/page-container';
import { db } from '@/lib/db';
import { contacts, interactions, companies } from '../../../../../drizzle/schema';
import { eq, desc, isNull } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import ContactDetailPage from '@/features/contacts/components/contact-detail-page';
import ContactForm from '@/features/contacts/components/contact-form';

type Props = {
  params: Promise<{ contactId: string }>;
  searchParams: Promise<{ edit?: string }>;
};

export default async function ContactPage({ params, searchParams }: Props) {
  const { contactId } = await params;
  const { edit } = await searchParams;

  const allCompanies = await db
    .select()
    .from(companies)
    .where(isNull(companies.archivedAt));

  if (contactId === 'new') {
    return (
      <PageContainer pageTitle='Add Contact' pageDescription='Create a new contact.'>
        <ContactForm initialData={null} companies={allCompanies} pageTitle='Add New Contact' />
      </PageContainer>
    );
  }

  const [contact] = await db.select().from(contacts).where(eq(contacts.id, contactId));
  if (!contact) notFound();

  if (edit === 'true') {
    return (
      <PageContainer pageTitle='Edit Contact' pageDescription={`Editing ${contact.firstName} ${contact.lastName}`}>
        <ContactForm
          initialData={contact}
          companies={allCompanies}
          pageTitle={`Edit ${contact.firstName} ${contact.lastName}`}
        />
      </PageContainer>
    );
  }

  const contactInteractions = await db
    .select()
    .from(interactions)
    .where(eq(interactions.contactId, contactId))
    .orderBy(desc(interactions.occurredAt));

  return (
    <PageContainer
      pageTitle={`${contact.firstName} ${contact.lastName}`}
      pageDescription='Contact details'
    >
      <ContactDetailPage contact={contact} interactions={contactInteractions} />
    </PageContainer>
  );
}
