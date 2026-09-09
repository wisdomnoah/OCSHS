import { useState } from 'react';
import { Pin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  useCrud, SectionHeader, AdminList, RowActions, FormShell, Field, SearchBar, StatusBadge, useToast, Toast,
} from '../components';
import type { Announcement, Priority, ContentStatus } from '@/lib/types';
import { PRIORITY_META } from '@/lib/types';

export function AdminAnnouncements() {
  const { toast, show } = useToast();
  const c = useCrud<Announcement>('announcements', 'is_pinned', false);
  const [search, setSearch] = useState('');
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const filtered = c.items.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    (a.body ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const togglePublish = async (a: Announcement) => {
    const newStatus: ContentStatus = a.status === 'published' ? 'draft' : 'published';
    const { error } = await supabase.from('announcements')
      .update({ status: newStatus, published_at: newStatus === 'published' ? new Date().toISOString() : null })
      .eq('id', a.id);
    if (error) show('Failed to update status.', 'error');
    else {
      show(newStatus === 'published' ? 'Announcement published.' : 'Announcement unpublished.');
      c.logAudit(newStatus === 'published' ? 'publish' : 'unpublish', 'announcements', a.id);
      c.load();
    }
  };

  return (
    <div className="space-y-4">
      {toast && <Toast {...toast} />}
      <SectionHeader
        title="Announcements"
        subtitle="Create and manage announcements that appear on the public site."
        onAdd={() => c.setCreating(true)}
        addLabel="New Announcement"
      />
      <SearchBar value={search} onChange={setSearch} placeholder="Search announcements…" />
      <AdminList loading={c.loading} error={c.error} count={filtered.length} emptyMsg="No announcements yet. Create your first one.">
        <div className="space-y-3">
          {filtered.map((a) => (
            <div key={a.id} className="card-glass flex items-start gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-white">{a.title}</h3>
                  {a.is_pinned && <Pin className="h-3.5 w-3.5 text-lilac-300" />}
                  <StatusBadge status={a.status} />
                  <span className={`chip ${PRIORITY_META[a.priority].color}`}>{PRIORITY_META[a.priority].label}</span>
                </div>
                {a.body && <p className="mt-1 line-clamp-2 text-sm text-cream/60">{a.body}</p>}
                <span className="mt-1 inline-block text-xs text-cream/40">{new Date(a.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button onClick={() => togglePublish(a)} className="rounded-lg bg-surface-2 px-3 py-1.5 text-xs font-medium text-cream transition hover:bg-emerald hover:text-emerald">
                  {a.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
                <RowActions onEdit={() => c.setEditing(a)} onDelete={() => c.remove(a.id, 'announcement')} />
              </div>
            </div>
          ))}
        </div>
      </AdminList>
      {(c.creating || c.editing) && (
        <AnnouncementForm
          initial={c.editing}
          onClose={() => { c.setCreating(false); c.setEditing(null); setSavedMsg(null); }}
          onSaved={(msg) => { c.setCreating(false); c.setEditing(null); c.load(); show(msg); }}
        />
      )}
    </div>
  );
}

function AnnouncementForm({ initial, onClose, onSaved }: {
  initial: Announcement | null; onClose: () => void; onSaved: (msg: string) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [body, setBody] = useState(initial?.body ?? '');
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'normal');
  const [isPinned, setIsPinned] = useState(initial?.is_pinned ?? false);
  const [status, setStatus] = useState<ContentStatus>(initial?.status ?? 'draft');
  const [featuredImage, setFeaturedImage] = useState(initial?.featured_image_url ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setBusy(true); setError(null);
    const payload = {
      title, body: body || null, priority, is_pinned: isPinned, status,
      featured_image_url: featuredImage || null,
      published_at: status === 'published' ? (initial?.published_at ?? new Date().toISOString()) : null,
    };
    const res = initial
      ? await supabase.from('announcements').update(payload).eq('id', initial.id)
      : await supabase.from('announcements').insert(payload);
    setBusy(false);
    if (res.error) { setError('Failed to save. Please try again.'); return; }
    await supabase.from('audit_log').insert({
      action: initial ? 'update' : 'create', entity_type: 'announcements',
      entity_id: initial?.id ?? '', details: { title, status },
    });
    onSaved(status === 'published' ? 'Announcement published.' : 'Announcement saved as draft.');
  };

  return (
    <FormShell title={initial ? 'Edit Announcement' : 'New Announcement'} onClose={onClose} onSave={save} busy={busy} error={error}
      saveLabel={status === 'published' ? 'Publish' : 'Save Draft'}
      extraActions={
        <button onClick={() => setStatus(status === 'published' ? 'draft' : 'published')} className="btn-ghost">
          {status === 'published' ? 'Switch to Draft' : 'Switch to Publish'}
        </button>
      }
    >
      <Field label="Title"><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
      <Field label="Content"><textarea rows={4} className="input resize-none" value={body} onChange={(e) => setBody(e.target.value)} /></Field>
      <Field label="Featured Image URL (optional)"><input className="input" value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} placeholder="https://…" /></Field>
      {featuredImage && <img src={featuredImage} alt="preview" className="h-32 w-full rounded-xl border border-white/10 object-cover" />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Priority">
          <select className="input" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
            <option value="low">Info</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option>
          </select>
        </Field>
        <Field label="Pinned">
          <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3">
            <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} className="accent-lilac" />
            <span className="text-sm text-cream">Pin to top</span>
          </label>
        </Field>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3">
        <StatusBadge status={status} />
        <span className="text-xs text-cream/50">Toggle the button below to switch status.</span>
      </div>
    </FormShell>
  );
}
