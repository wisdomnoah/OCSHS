import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  useCrud as _unused, SectionHeader, AdminList, RowActions, FormShell, Field, SearchBar, StatusBadge, useToast, Toast,
} from '../components';
import { useAuth } from '@/lib/auth';
import type { Page, ContentStatus } from '@/lib/types';

// useCrud doesn't work for pages because we need realtime; use simple fetch
import { useEffect, useState as useStateReact } from 'react';

function usePages() {
  const [pages, setPages] = useStateReact<Page[]>([]);
  const [loading, setLoading] = useStateReact(true);
  const [error, setError] = useStateReact<string | null>(null);
  const { user } = useAuth();

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('pages').select('*').order('updated_at', { ascending: false });
    if (error) setError('Failed to load pages.'); else setPages((data ?? []) as Page[]);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const remove = async (id: string) => {
    if (!confirm('Delete this page? This cannot be undone.')) return;
    await supabase.from('pages').delete().eq('id', id);
    if (user) await supabase.from('audit_log').insert({ action: 'delete', entity_type: 'pages', entity_id: id, details: {} });
    load();
  };

  return { pages, loading, error, load, remove };
}

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

export function AdminPages() {
  const { toast, show } = useToast();
  const { pages, loading, error, load, remove } = usePages();
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setPageEditing] = useState<Page | null>(null);

  const filtered = pages.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      {toast && <Toast {...toast} />}
      <SectionHeader title="Pages" subtitle="Create and manage custom pages for your site." onAdd={() => setCreating(true)} addLabel="New Page" />
      <SearchBar value={search} onChange={setSearch} placeholder="Search pages…" />
      <AdminList loading={loading} error={error} count={filtered.length} emptyMsg="No pages yet. Create your first one.">
        <div className="space-y-3">
          {filtered.map((p) => (
            <div key={p.id} className="card-glass flex items-start gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-white">{p.title}</h3>
                  <StatusBadge status={p.status} />
                </div>
                <p className="mt-1 text-xs text-cream/40">/{p.slug}</p>
                {p.content && <p className="mt-1 line-clamp-2 text-sm text-cream/60">{p.content}</p>}
              </div>
              <RowActions onEdit={() => setPageEditing(p)} onDelete={() => remove(p.id)} />
            </div>
          ))}
        </div>
      </AdminList>
      {(creating || editing) && (
        <PageForm initial={editing} onClose={() => { setCreating(false); setPageEditing(null); }} onSaved={(msg) => { setCreating(false); setPageEditing(null); load(); show(msg); }} />
      )}
    </div>
  );
}

function PageForm({ initial, onClose, onSaved }: { initial: Page | null; onClose: () => void; onSaved: (msg: string) => void }) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [featuredImage, setFeaturedImage] = useState(initial?.featured_image_url ?? '');
  const [status, setStatus] = useState<ContentStatus>(initial?.status ?? 'draft');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setBusy(true); setError(null);
    const finalSlug = slug || slugify(title);
    if (!title) { setError('Title is required.'); setBusy(false); return; }
    if (!finalSlug) { setError('Slug is required.'); setBusy(false); return; }
    const payload = {
      title, slug: finalSlug, content: content || null,
      featured_image_url: featuredImage || null, status,
      published_at: status === 'published' ? (initial?.published_at ?? new Date().toISOString()) : null,
    };
    const res = initial ? await supabase.from('pages').update(payload).eq('id', initial.id) : await supabase.from('pages').insert(payload);
    setBusy(false);
    if (res.error) { setError('Failed to save. The slug may already be in use.'); return; }
    onSaved(status === 'published' ? 'Page published.' : 'Page saved as draft.');
  };

  return (
    <FormShell title={initial ? 'Edit Page' : 'New Page'} onClose={onClose} onSave={save} busy={busy} error={error}
      saveLabel={status === 'published' ? 'Publish' : 'Save Draft'}
      extraActions={<button onClick={() => setStatus(status === 'published' ? 'draft' : 'published')} className="btn-ghost">{status === 'published' ? 'Switch to Draft' : 'Switch to Publish'}</button>}
    >
      <Field label="Title"><input className="input" value={title} onChange={(e) => { setTitle(e.target.value); if (!slug) setSlug(slugify(e.target.value)); }} /></Field>
      <Field label="Slug (URL)"><input className="input" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated" /></Field>
      <Field label="Content"><textarea rows={8} className="input resize-none" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write the page content here…" /></Field>
      <Field label="Featured Image URL (optional)"><input className="input" value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} placeholder="https://…" /></Field>
      {featuredImage && <img src={featuredImage} alt="preview" className="h-32 w-full rounded-xl border border-white/10 object-cover" />}
    </FormShell>
  );
}
