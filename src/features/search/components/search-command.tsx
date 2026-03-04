'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import {
  IconBuilding,
  IconAddressBook,
  IconBriefcase,
  IconNotebook
} from '@tabler/icons-react';

type SearchResults = {
  companies: { id: string; name: string; industry: string | null; priority: string | null }[];
  contacts: { id: string; name: string; title: string | null; company: string | null }[];
  applications: { id: string; roleTitle: string; companyName: string; status: string }[];
  notes: { id: string; title: string; category: string | null }[];
};

export function SearchCommand() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults(null);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`, {
          signal: controller.signal
        });
        const json = await res.json();
        if (json.success) {
          setResults(json.data);
        }
      } catch {
        // Aborted or network error — ignore
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const navigate = useCallback(
    (path: string) => {
      setOpen(false);
      setQuery('');
      setResults(null);
      router.push(path);
    },
    [router]
  );

  const hasResults =
    results &&
    (results.companies.length > 0 ||
      results.contacts.length > 0 ||
      results.applications.length > 0 ||
      results.notes.length > 0);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search companies, contacts, applications, notes..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {loading && (
          <div className="text-muted-foreground py-6 text-center text-sm">
            Searching...
          </div>
        )}
        {!loading && query.length >= 2 && !hasResults && (
          <CommandEmpty>No results found.</CommandEmpty>
        )}
        {!loading && query.length < 2 && (
          <CommandEmpty>Type at least 2 characters to search.</CommandEmpty>
        )}

        {results && results.companies.length > 0 && (
          <CommandGroup heading="Companies">
            {results.companies.map((c) => (
              <CommandItem
                key={c.id}
                value={`company-${c.name}`}
                onSelect={() => navigate(`/dashboard/companies/${c.id}`)}
              >
                <IconBuilding className="mr-2 h-4 w-4 shrink-0" />
                <span className="flex-1">{c.name}</span>
                {c.priority && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {c.priority}
                  </Badge>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results && results.contacts.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Contacts">
              {results.contacts.map((c) => (
                <CommandItem
                  key={c.id}
                  value={`contact-${c.name}`}
                  onSelect={() => navigate(`/dashboard/contacts/${c.id}`)}
                >
                  <IconAddressBook className="mr-2 h-4 w-4 shrink-0" />
                  <span className="flex-1">
                    {c.name}
                    {c.title && (
                      <span className="text-muted-foreground ml-1 text-xs">
                        — {c.title}
                      </span>
                    )}
                  </span>
                  {c.company && (
                    <span className="text-muted-foreground text-xs">
                      {c.company}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {results && results.applications.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Applications">
              {results.applications.map((a) => (
                <CommandItem
                  key={a.id}
                  value={`application-${a.roleTitle}-${a.companyName}`}
                  onSelect={() => navigate(`/dashboard/pipeline`)}
                >
                  <IconBriefcase className="mr-2 h-4 w-4 shrink-0" />
                  <span className="flex-1">
                    {a.roleTitle}
                    <span className="text-muted-foreground ml-1 text-xs">
                      at {a.companyName}
                    </span>
                  </span>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {a.status.replace(/_/g, ' ')}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {results && results.notes.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Notes">
              {results.notes.map((n) => (
                <CommandItem
                  key={n.id}
                  value={`note-${n.title}`}
                  onSelect={() => navigate(`/dashboard/notes/${n.id}`)}
                >
                  <IconNotebook className="mr-2 h-4 w-4 shrink-0" />
                  <span className="flex-1">{n.title}</span>
                  {n.category && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {n.category.replace(/_/g, ' ')}
                    </Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
