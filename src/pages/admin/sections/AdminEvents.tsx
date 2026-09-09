import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  useCrud, SectionHeader, AdminList, RowActions, FormShell, Field, SearchBar, StatusBadge, useToast, Toast,
} from '../components';
import type { SchoolEvent, EventCategory, ContentStatus } from '@/lib/types';

export function AdminEvents() {
  const { toast, show } = useToast();
  const c = useCrud<SchoolEvent>('events', 'event_date', true);
  const [search, setSearch] = useState('');

  const filtered = c.items.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()));

  const togglePublish = async (e: SchoolEvent) => {
    const newStatus: ContentStatus = e.status === 'published' ? 'draft' : 'published';
    const { error } = await supabase.from('events')
      .update({ status: newStatus, published_at: newStatus === 'published' ? new Date().toISOString() : null })
      .eq('id', e.id);
    if (error) show('Failed to update status.', 'error');
    else { show(newStatus === 'published' ? 'Event published.' : 'Event unpublished.'); c.load(); }
  };

  return (
    <div className="space-y-4">
      {toast && <Toast {...toast} />}
      <SectionHeader title="Events" subtitle="Manage school events, dates, and locations." onAdd={() => c.setCreating(true)} addLabel="New Event" />
      <SearchBar value={search} onChange={setSearch} placeholder="Search events…" />
      <AdminList loading={c.loading} error={c.error} count={filtered.length} emptyMsg="No events yet.">
        <div className="space-y-3">
          {filtered.map((e) => (
            <div key={e.id} className="card-glass flex items-start gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-white">{e.title}</h3>
                  <StatusBadge status={e.status} />
                </div>
                <p className="mt-1 text-xs text-cream/50">
                  {new Date(e.event_date).toLocaleDateString()}{e.end_date ? ` → ${new Date(e.end_date).toLocaleDateString()}` : ''}
                  {e.event_time ? ` · ${e.event_time}` : ''} · {e.category}{e.location ? ` · ${e.location}` : ''}
                </p>
                {e.description && <p className="mt-1 line-clamp-2 text-sm text-cream/60">{e.description}</p>}
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button onClick={() => togglePublish(e)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-cream/70 transition hover:border-emerald/50 hover:text-emerald">
                  {e.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
                <RowActions onEdit={() => c.setEditing(e)} onDelete={() => c.remove(e.id, 'event')} />
              </div>
            </div>
          ))}
        </div>
      </AdminList>
      {(c.creating || c.editing) && (
        <EventForm initial={c.editing} onClose={() => { c.setCreating(false); c.setEditing(null); }} onSaved={(msg) => { c.setCreating(false); c.setEditing(null); c.load(); show(msg); }} />
      )}
    </div>
  );
}

function EventForm({ initial, onClose, onSaved }: { initial: SchoolEvent | null; onClose: () => void; onSaved: (msg: string) => void }) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [eventDate, setEventDate] = useState(initial?.event_date ?? new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(initial?.end_date ?? '');
  const [eventTime, setEventTime] = useState(initial?.event_time ?? '');
  const [location, setLocation] = useState(initial?.location ?? '');
  const [category, setCategory] = useState<EventCategory>(initial?.category ?? 'general');
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? '');
  const [status, setStatus] = useState<ContentStatus>(initial?.status ?? 'draft');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setBusy(true); setError(null);
    const payload = {
      title, description: description || null, event_date: eventDate,
      end_date: endDate || null, event_time: eventTime || null,
      location: location || null, category, image_url: imageUrl || null, status,
      published_at: status === 'published' ? (initial?.published_at ?? new Date().toISOString()) : null,
    };
    const res = initial ? await supabase.from('events').update(payload).eq('id', initial.id) : await supabase.from('events').insert(payload);
    setBusy(false);
    if (res.error) { setError('Failed to save. Please try again.'); return; }
    onSaved(status === 'published' ? 'Event published.' : 'Event saved as draft.');
  };

  return (
    <FormShell title={initial ? 'Edit Event' : 'New Event'} onClose={onClose} onSave={save} busy={busy} error={error}
      saveLabel={status === 'published' ? 'Publish' : 'Save Draft'}
      extraActions={<button onClick={() => setStatus(status === 'published' ? 'draft' : 'published')} className="btn-ghost">{status === 'published' ? 'Switch to Draft' : 'Switch to Publish'}</button>}
    >
      <Field label="Title"><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
      <Field label="Description"><textarea rows={3} className="input resize-none" value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Start Date"><input type="date" className="input" value={eventDate} onChange={(e) => setEventDate(e.target.value)} /></Field>
        <Field label="End Date (optional)"><input type="date" className="input" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Time (optional)"><input type="time" className="input" value={eventTime} onChange={(e) => setEventTime(e.target.value)} /></Field>
        <Field label="Location"><input className="input" value={location} onChange={(e) => setLocation(e.target.value)} /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category">
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value as EventCategory)}>
            <option value="general">General</option><option value="academic">Academic</option><option value="arts">Arts</option>
            <option value="sports">Sports</option><option value="community">Community</option><option value="exam">Exam</option>
          </select>
        </Field>
      </div>
      <Field label="Event Image URL (optional)"><input className="input" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" /></Field>
      {imageUrl && <img src={imageUrl} alt="preview" className="h-32 w-full rounded-xl border border-white/10 object-cover" />}
    </FormShell>
  );
}
