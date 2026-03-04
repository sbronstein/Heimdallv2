'use client';
import { navItems } from '@/config/nav-config';
import {
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarSearch,
  useRegisterActions,
  useKBar
} from 'kbar';
import { useRouter } from 'next/navigation';
import { useMemo, useEffect, useState, useCallback } from 'react';
import RenderResults from './render-result';
import useThemeSwitching from './use-theme-switching';
import { useFilteredNavItems } from '@/hooks/use-nav';

function useEntitySearch() {
  const { searchQuery } = useKBar((state) => ({ searchQuery: state.searchQuery }));
  const router = useRouter();
  const [entityActions, setEntityActions] = useState<any[]>([]);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setEntityActions([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery)}&limit=3`,
          { signal: controller.signal }
        );
        const json = await res.json();
        if (!json.success) return;

        const actions: any[] = [];
        const d = json.data;

        d.companies?.forEach((c: any) => {
          actions.push({
            id: `search-company-${c.id}`,
            name: c.name,
            subtitle: c.industry || 'Company',
            section: 'Companies',
            perform: () => router.push(`/dashboard/companies/${c.id}`)
          });
        });

        d.contacts?.forEach((c: any) => {
          actions.push({
            id: `search-contact-${c.id}`,
            name: c.name,
            subtitle: [c.title, c.company].filter(Boolean).join(' at ') || 'Contact',
            section: 'Contacts',
            perform: () => router.push(`/dashboard/contacts/${c.id}`)
          });
        });

        d.applications?.forEach((a: any) => {
          actions.push({
            id: `search-app-${a.id}`,
            name: `${a.roleTitle} at ${a.companyName}`,
            subtitle: a.status.replace(/_/g, ' '),
            section: 'Applications',
            perform: () => router.push('/dashboard/pipeline')
          });
        });

        d.notes?.forEach((n: any) => {
          actions.push({
            id: `search-note-${n.id}`,
            name: n.title,
            subtitle: n.category?.replace(/_/g, ' ') || 'Note',
            section: 'Notes',
            perform: () => router.push(`/dashboard/notes/${n.id}`)
          });
        });

        setEntityActions(actions);
      } catch {
        // Aborted or network error
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, router]);

  useRegisterActions(entityActions, [entityActions]);
}

export default function KBar({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const filteredItems = useFilteredNavItems(navItems);

  // These action are for the navigation
  const actions = useMemo(() => {
    // Define navigateTo inside the useMemo callback to avoid dependency array issues
    const navigateTo = (url: string) => {
      router.push(url);
    };

    return filteredItems.flatMap((navItem) => {
      // Only include base action if the navItem has a real URL and is not just a container
      const baseAction =
        navItem.url !== '#'
          ? {
              id: `${navItem.title.toLowerCase()}Action`,
              name: navItem.title,
              shortcut: navItem.shortcut,
              keywords: navItem.title.toLowerCase(),
              section: 'Navigation',
              subtitle: `Go to ${navItem.title}`,
              perform: () => navigateTo(navItem.url)
            }
          : null;

      // Map child items into actions
      const childActions =
        navItem.items?.map((childItem) => ({
          id: `${childItem.title.toLowerCase()}Action`,
          name: childItem.title,
          shortcut: childItem.shortcut,
          keywords: childItem.title.toLowerCase(),
          section: navItem.title,
          subtitle: `Go to ${childItem.title}`,
          perform: () => navigateTo(childItem.url)
        })) ?? [];

      // Return only valid actions (ignoring null base actions for containers)
      return baseAction ? [baseAction, ...childActions] : childActions;
    });
  }, [router, filteredItems]);

  return (
    <KBarProvider actions={actions}>
      <KBarComponent>{children}</KBarComponent>
    </KBarProvider>
  );
}
const KBarComponent = ({ children }: { children: React.ReactNode }) => {
  useThemeSwitching();
  useEntitySearch();

  return (
    <>
      <KBarPortal>
        <KBarPositioner className='bg-background/80 fixed inset-0 z-99999 p-0! backdrop-blur-sm'>
          <KBarAnimator className='bg-card text-card-foreground relative mt-64! w-full max-w-[600px] -translate-y-12! overflow-hidden rounded-lg border shadow-lg'>
            <div className='bg-card border-border sticky top-0 z-10 border-b'>
              <KBarSearch className='bg-card w-full border-none px-6 py-4 text-lg outline-hidden focus:ring-0 focus:ring-offset-0 focus:outline-hidden' />
            </div>
            <div className='max-h-[400px]'>
              <RenderResults />
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  );
};
