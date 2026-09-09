import { useEffect, useState, useRef } from 'react';
import { supabase } from './supabase';
import type {
  Announcement,
  SchoolEvent,
  GalleryItem,
  Award,
  StaffMember,
  Program,
  TimelineMilestone,
  ContactMessage,
  SiteSettings,
  HomepageContent,
  Page,
  AuditLogEntry,
} from './types';

function useRealtime<T extends { id: string }>(
  table: string,
  order: string,
  ascending = true,
  filter?: { column: string; value: string } | null
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    (async () => {
      try {
        let q = supabase.from(table).select('*').order(order, { ascending });
        if (filter) q = q.eq(filter.column, filter.value);
        const res = await q;
        if (!active) return;
        if (res.error) setError('Failed to load data.');
        else setData((res.data ?? []) as T[]);
      } catch {
        if (active) setError('Failed to load data.');
      } finally {
        if (active) setLoading(false);
      }
    })();

    const channel = supabase
      .channel(`rt-${table}-${filter?.value ?? 'all'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        (async () => {
          try {
            let q = supabase.from(table).select('*').order(order, { ascending });
            if (filter) q = q.eq(filter.column, filter.value);
            const res = await q;
            if (res.data) setData(res.data as T[]);
          } catch { /* ignore */ }
        })();
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      active = false;
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    };
  }, [table, order, ascending, filter?.column, filter?.value]);

  return { data, loading, error };
}

export function useAnnouncements() {
  return useRealtime<Announcement>('announcements', 'is_pinned', false);
}
export function useEvents() {
  return useRealtime<SchoolEvent>('events', 'event_date', true);
}
export function useGallery(filter?: string | null) {
  return useRealtime<GalleryItem>(
    'gallery_items', 'sort_order', true,
    filter ? { column: 'category', value: filter } : null
  );
}
export function useAwards() {
  return useRealtime<Award>('awards', 'year', false);
}
export function useStaff() {
  return useRealtime<StaffMember>('staff', 'sort_order', true);
}
export function usePrograms(filter?: string | null) {
  return useRealtime<Program>(
    'programs', 'sort_order', true,
    filter ? { column: 'category', value: filter } : null
  );
}
export function useTimeline() {
  return useRealtime<TimelineMilestone>('timeline_milestones', 'sort_order', true);
}
export function useContactMessages() {
  return useRealtime<ContactMessage>('contact_messages', 'created_at', false);
}

export function useSiteSettings(): { settings: SiteSettings | null; loading: boolean; error: string | null } {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    supabase.from('site_settings').select('*').eq('id', 1).maybeSingle()
      .then(({ data, error }) => {
        if (error) setError('Failed to load settings.');
        else setSettings(data as SiteSettings);
        setLoading(false);
      });
    const ch = supabase.channel('rt-site-settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, () => {
        supabase.from('site_settings').select('*').eq('id', 1).maybeSingle()
          .then(({ data }) => data && setSettings(data as SiteSettings));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);
  return { settings, loading, error };
}

export function useHomepageContent(): { content: HomepageContent | null; loading: boolean; error: string | null } {
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    supabase.from('homepage_content').select('*').eq('id', 1).maybeSingle()
      .then(({ data, error }) => {
        if (error) setError('Failed to load homepage content.');
        else setContent(data as HomepageContent);
        setLoading(false);
      });
    const ch = supabase.channel('rt-homepage-content')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'homepage_content' }, () => {
        supabase.from('homepage_content').select('*').eq('id', 1).maybeSingle()
          .then(({ data }) => data && setContent(data as HomepageContent));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);
  return { content, loading, error };
}

export function usePages(): { pages: Page[]; loading: boolean; error: string | null } {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    supabase.from('pages').select('*').order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError('Failed to load pages.');
        else setPages((data ?? []) as Page[]);
        setLoading(false);
      });
    const ch = supabase.channel('rt-pages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pages' }, () => {
        supabase.from('pages').select('*').order('updated_at', { ascending: false })
          .then(({ data }) => data && setPages(data as Page[]));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);
  return { pages, loading, error };
}

export function useAuditLog(): { entries: AuditLogEntry[]; loading: boolean; error: string | null } {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(100)
      .then(({ data, error }) => {
        if (error) setError('Failed to load audit log.');
        else setEntries((data ?? []) as AuditLogEntry[]);
        setLoading(false);
      });
    const ch = supabase.channel('rt-audit-log')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_log' }, () => {
        supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(100)
          .then(({ data }) => data && setEntries(data as AuditLogEntry[]));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);
  return { entries, loading, error };
}
