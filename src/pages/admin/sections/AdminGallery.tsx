import { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  useCrud, SectionHeader, AdminList, RowActions, FormShell, Field, SearchBar, StatusBadge, useToast, Toast,
} from '../components';
import { uploadMedia } from '@/lib/storage';
import { useAuth } from '@/lib/auth';
import type { GalleryItem, GalleryCategory, ContentStatus } from '@/lib/types';
import { GALLERY_CATEGORY_META } from '@/lib/types';

export function AdminGallery() {
  const { toast, show } = useToast();
  const c = useCrud<GalleryItem>('gallery_items', 'sort_order', true);
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<GalleryCategory | ''>('');

  const filtered = c.items.filter((g) => {
    const matchSearch = g.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = !filter || g.category === filter;
    return matchSearch && matchFilter;
  });

  const togglePublish = async (g: GalleryItem) => {
    const newStatus: ContentStatus = g.status === 'published' ? 'draft' : 'published';
    const { error } = await supabase.from('gallery_items').update({ status: newStatus }).eq('id', g.id);
    if (error) show('Failed to update.', 'error');
    else { show(newStatus === 'published' ? 'Image published.' : 'Image unpublished.'); c.load(); }
  };

  return (
    <div className="space-y-4">
      {toast && <Toast {...toast} />}
      <SectionHeader title="Gallery" subtitle="Upload and manage gallery images shown on the public site." onAdd={() => c.setCreating(true)} addLabel="New Image" />
      <div className="flex flex-wrap gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search images…" />
        <select className="input max-w-40" value={filter} onChange={(e) => setFilter(e.target.value as GalleryCategory | '')}>
          <option value="">All categories</option>
          {Object.entries(GALLERY_CATEGORY_META).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <AdminList loading={c.loading} error={c.error} count={filtered.length} emptyMsg="No gallery images yet.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((g) => (
            <div key={g.id} className="card-glass overflow-hidden">
              <div className="relative aspect-video"><img src={g.image_url} alt={g.title} className="h-full w-full object-cover" /></div>
              <div className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0"><p className="truncate text-sm font-medium text-white">{g.title}</p><p className="text-xs text-cream/40">{GALLERY_CATEGORY_META[g.category]}</p></div>
                  <StatusBadge status={g.status} />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <button onClick={() => togglePublish(g)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-cream/70 transition hover:border-emerald/50 hover:text-emerald">
                    {g.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <RowActions small onEdit={() => c.setEditing(g)} onDelete={() => c.remove(g.id, 'image')} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </AdminList>
      {(c.creating || c.editing) && (
        <GalleryForm initial={c.editing} userId={user?.id ?? ''} onClose={() => { c.setCreating(false); c.setEditing(null); }} onSaved={(msg) => { c.setCreating(false); c.setEditing(null); c.load(); show(msg); }} />
      )}
    </div>
  );
}

function GalleryForm({ initial, userId, onClose, onSaved }: {
  initial: GalleryItem | null; userId: string; onClose: () => void; onSaved: (msg: string) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [category, setCategory] = useState<GalleryCategory>(initial?.category ?? 'campus');
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [sortOrder, setSortOrder] = useState(initial?.sort_order ?? 0);
  const [status, setStatus] = useState<ContentStatus>(initial?.status ?? 'draft');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploading(true);
    const { url, error: uerr } = await uploadMedia(file, userId);
    setUploading(false);
    if (uerr) setError(uerr);
    else setImageUrl(url);
  };

  const save = async () => {
    setBusy(true); setError(null);
    if (!imageUrl) { setError('Please provide an image.'); setBusy(false); return; }
    const payload = { title, category, image_url: imageUrl, description: description || null, sort_order: Number(sortOrder), status };
    const res = initial ? await supabase.from('gallery_items').update(payload).eq('id', initial.id) : await supabase.from('gallery_items').insert(payload);
    setBusy(false);
    if (res.error) { setError('Failed to save.'); return; }
    onSaved(status === 'published' ? 'Image published.' : 'Image saved as draft.');
  };

  return (
    <FormShell title={initial ? 'Edit Image' : 'New Image'} onClose={onClose} onSave={save} busy={busy} error={error}
      saveLabel={status === 'published' ? 'Publish' : 'Save Draft'}
      extraActions={<button onClick={() => setStatus(status === 'published' ? 'draft' : 'published')} className="btn-ghost">{status === 'published' ? 'Switch to Draft' : 'Switch to Publish'}</button>}
    >
      <Field label="Title"><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category">
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value as GalleryCategory)}>
            {Object.entries(GALLERY_CATEGORY_META).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
        <Field label="Sort order"><input type="number" className="input" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} /></Field>
      </div>
      <Field label="Image">
        <div className="flex gap-2">
          <input className="input" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://… or upload" />
          <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-cream/70 transition hover:border-lilac/50 hover:text-lilac-300">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
      </Field>
      {imageUrl && <img src={imageUrl} alt="preview" className="h-40 w-full rounded-xl border border-white/10 object-cover" />}
      <Field label="Description"><textarea rows={2} className="input resize-none" value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
    </FormShell>
  );
}
