import { useState, useEffect } from 'react';
import { Upload, Trash2, Loader2, FolderOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { uploadMedia, deleteMedia, listMedia } from '@/lib/storage';
import { SectionHeader, SearchBar, useToast, Toast } from '../components';
import type { MediaItem } from '@/lib/types';

export function AdminMedia() {
  const { user } = useAuth();
  const { toast, show } = useToast();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { items, error } = await listMedia(user.id);
    if (error) show('Failed to load media.', 'error');
    else setItems(items);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.id]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;
    setUploading(true);
    let ok = 0;
    for (const file of Array.from(files)) {
      const { error } = await uploadMedia(file, user.id);
      if (!error) ok++;
    }
    setUploading(false);
    if (ok > 0) { show(`${ok} file(s) uploaded.`); load(); }
    else show('Upload failed.', 'error');
  };

  const handleDelete = async (item: MediaItem) => {
    if (!confirm('Delete this file? It will be removed from the site.')) return;
    const path = `${user?.id}/${item.name}`;
    const { error } = await deleteMedia(path);
    if (error) show('Failed to delete.', 'error');
    else { show('File deleted.'); load(); }
  };

  const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
  const fmtSize = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${Math.round(b / 1024)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <div className="space-y-4">
      {toast && <Toast {...toast} />}
      <SectionHeader title="Media Library" subtitle="Upload and manage images used across the site." />

      <div className="flex flex-wrap items-center gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search media…" />
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-lilac/40 bg-lilac/10 px-5 py-3 text-sm font-semibold text-lilac-300 transition hover:bg-lilac/20">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? 'Uploading…' : 'Upload Images'}
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-lilac" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FolderOpen className="mb-3 h-12 w-12 text-cream/20" />
          <p className="text-sm text-cream/50">{search ? 'No matching files.' : 'No media uploaded yet. Upload images to reuse across the site.'}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((item) => (
            <div key={item.id} className="card-glass overflow-hidden">
              <div className="relative aspect-square bg-ink-900">
                <img src={item.publicUrl} alt={item.name} className="h-full w-full object-cover" />
                <button
                  onClick={() => { navigator.clipboard?.writeText(item.publicUrl); show('Image URL copied to clipboard.'); }}
                  className="absolute bottom-2 right-2 rounded-lg bg-surface-2/90 px-2 py-1 text-[10px] text-cream transition hover:bg-lilac hover:text-white"
                >
                  Copy URL
                </button>
              </div>
              <div className="flex items-center justify-between p-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-white">{item.name}</p>
                  <p className="text-[10px] text-cream/40">{fmtSize(item.metadata?.size ?? 0)}</p>
                </div>
                <button onClick={() => handleDelete(item)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-2 text-cream transition hover:bg-red-500 hover:text-white">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
