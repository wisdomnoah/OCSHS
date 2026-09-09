import { useState } from 'react';
import { Upload, Loader2, Users as UsersIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  useCrud, SectionHeader, AdminList, RowActions, FormShell, Field, SearchBar, StatusBadge, useToast, Toast,
} from '../components';
import { uploadMedia } from '@/lib/storage';
import { useAuth } from '@/lib/auth';
import type { StaffMember, ContentStatus } from '@/lib/types';

export function AdminStaff() {
  const { toast, show } = useToast();
  const c = useCrud<StaffMember>('staff', 'sort_order', true);
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const filtered = c.items.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase()) ||
    s.department.toLowerCase().includes(search.toLowerCase())
  );

  const togglePublish = async (s: StaffMember) => {
    const newStatus: ContentStatus = s.status === 'published' ? 'draft' : 'published';
    const { error } = await supabase.from('staff').update({ status: newStatus }).eq('id', s.id);
    if (error) show('Failed to update.', 'error');
    else { show(newStatus === 'published' ? 'Staff member published.' : 'Staff member unpublished.'); c.load(); }
  };

  return (
    <div className="space-y-4">
      {toast && <Toast {...toast} />}
      <SectionHeader title="Staff / Teachers" subtitle="Manage staff profiles shown on the public staff page." onAdd={() => c.setCreating(true)} addLabel="Add Staff" />
      <SearchBar value={search} onChange={setSearch} placeholder="Search staff…" />
      <AdminList loading={c.loading} error={c.error} count={filtered.length} emptyMsg="No staff members yet.">
        <div className="space-y-3">
          {filtered.map((s) => (
            <div key={s.id} className="card-glass flex items-center gap-3 p-4">
              {s.photo_url ? <img src={s.photo_url} alt={s.name} className="h-12 w-12 shrink-0 rounded-xl border border-lilac/30 object-cover" /> : <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-white/10 bg-ink-800 text-cream/30"><UsersIcon className="h-5 w-5" /></div>}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-white">{s.name}</h3>
                  <StatusBadge status={s.status} />
                </div>
                <p className="text-xs text-cream/50">{s.role} · {s.department}{s.email ? ` · ${s.email}` : ''}</p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button onClick={() => togglePublish(s)} className="rounded-lg bg-surface-2 px-3 py-1.5 text-xs font-medium text-cream transition hover:bg-emerald hover:text-emerald">
                  {s.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
                <RowActions onEdit={() => c.setEditing(s)} onDelete={() => c.remove(s.id, 'staff member')} />
              </div>
            </div>
          ))}
        </div>
      </AdminList>
      {(c.creating || c.editing) && (
        <StaffForm initial={c.editing} userId={user?.id ?? ''} onClose={() => { c.setCreating(false); c.setEditing(null); }} onSaved={(msg) => { c.setCreating(false); c.setEditing(null); c.load(); show(msg); }} />
      )}
    </div>
  );
}

function StaffForm({ initial, userId, onClose, onSaved }: {
  initial: StaffMember | null; userId: string; onClose: () => void; onSaved: (msg: string) => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [department, setDepartment] = useState(initial?.department ?? 'Administration');
  const [role, setRole] = useState(initial?.role ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [photoUrl, setPhotoUrl] = useState(initial?.photo_url ?? '');
  const [bio, setBio] = useState(initial?.bio ?? '');
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
    else setPhotoUrl(url);
  };

  const save = async () => {
    setBusy(true); setError(null);
    const payload = { name, department, role, email: email || null, photo_url: photoUrl || null, bio: bio || null, sort_order: Number(sortOrder), status };
    const res = initial ? await supabase.from('staff').update(payload).eq('id', initial.id) : await supabase.from('staff').insert(payload);
    setBusy(false);
    if (res.error) { setError('Failed to save.'); return; }
    onSaved(status === 'published' ? 'Staff member published.' : 'Staff member saved as draft.');
  };

  return (
    <FormShell title={initial ? 'Edit Staff Member' : 'New Staff Member'} onClose={onClose} onSave={save} busy={busy} error={error}
      saveLabel={status === 'published' ? 'Publish' : 'Save Draft'}
      extraActions={<button onClick={() => setStatus(status === 'published' ? 'draft' : 'published')} className="btn-ghost">{status === 'published' ? 'Switch to Draft' : 'Switch to Publish'}</button>}
    >
      <Field label="Full Name"><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Department"><input className="input" value={department} onChange={(e) => setDepartment(e.target.value)} /></Field>
        <Field label="Role / Title"><input className="input" value={role} onChange={(e) => setRole(e.target.value)} /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email"><input className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label="Sort Order"><input type="number" className="input" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} /></Field>
      </div>
      <Field label="Profile Photo">
        <div className="flex gap-2">
          <input className="input" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://… or upload" />
          <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-surface-2 px-4 py-3 text-sm text-cream transition hover:bg-lilac hover:text-white">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
      </Field>
      {photoUrl && <img src={photoUrl} alt="preview" className="h-28 w-28 rounded-xl border border-white/10 object-cover" />}
      <Field label="Bio"><textarea rows={3} className="input resize-none" value={bio} onChange={(e) => setBio(e.target.value)} /></Field>
    </FormShell>
  );
}
