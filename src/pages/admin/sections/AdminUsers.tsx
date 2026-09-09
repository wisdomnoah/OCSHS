import { useState, useEffect } from 'react';
import { Loader2, UserPlus, KeyRound, Ban, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { SectionHeader, SearchBar, FormShell, Field, useToast, Toast, StatusBadge } from '../components';
import { Modal } from '@/components/Modal';
import type { AdminUser, UserRole } from '@/lib/types';
import { ROLE_META } from '@/lib/types';

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`;

export function AdminUsers({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const { toast, show } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);

  const load = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(FN_URL, {
      headers: { Authorization: `Bearer ${session?.access_token ?? ''}` },
    });
    const json = await res.json();
    if (json.users) setUsers(json.users as AdminUser[]);
    else show('Failed to load users.', 'error');
    setLoading(false);
  };

  useEffect(() => { if (isSuperAdmin) load(); /* eslint-disable-next-line */ }, [isSuperAdmin]);

  if (!isSuperAdmin) {
    return (
      <div className="py-20 text-center">
        <Ban className="mx-auto mb-3 h-10 w-10 text-cream/30" />
        <h2 className="font-display text-lg font-semibold text-white">Access Denied</h2>
        <p className="mt-2 text-sm text-cream/60">Only Super Admins can manage users.</p>
      </div>
    );
  }

  const filtered = users.filter((u) => u.email.toLowerCase().includes(search.toLowerCase()));

  const setRole = async (user: AdminUser, role: UserRole) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${FN_URL}/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token ?? ''}` },
      body: JSON.stringify({ role }),
    });
    if (res.ok) { show('Role updated.'); load(); }
    else show('Failed to update role.', 'error');
  };

  const toggleDisable = async (user: AdminUser) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${FN_URL}/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token ?? ''}` },
      body: JSON.stringify({ disabled: !user.disabled }),
    });
    if (res.ok) { show(user.disabled ? 'User enabled.' : 'User disabled.'); load(); }
    else show('Failed to update user.', 'error');
  };

  return (
    <div className="space-y-4">
      {toast && <Toast {...toast} />}
      <SectionHeader title="Users" subtitle="Manage admin accounts and roles." onAdd={() => setCreating(true)} addLabel="Add User" />
      <SearchBar value={search} onChange={setSearch} placeholder="Search users…" />

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-lilac" /></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((u) => (
            <div key={u.id} className="card-glass flex items-center gap-3 p-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-lilac/30 bg-lilac/10 text-sm font-semibold text-lilac-300">
                {(u.email ?? '?')[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium text-white">{u.email}</p>
                  <span className={`chip ${ROLE_META[u.role].color}`}>{ROLE_META[u.role].label}</span>
                  {u.disabled && <span className="chip bg-red-500 text-white">Disabled</span>}
                </div>
                <p className="text-xs text-cream/40">{u.full_name ?? 'No name'} · Joined {new Date(u.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                {u.role !== 'super_admin' && (
                  <button
                    onClick={() => setRole(u, u.role === 'super_admin' ? 'content_editor' : 'super_admin')}
                    className="rounded-lg bg-surface-2 px-3 py-1.5 text-xs font-medium text-cream transition hover:bg-lilac hover:text-white"
                  >
                    {u.role === 'super_admin' ? 'Make Editor' : 'Make Admin'}
                  </button>
                )}
                <button
                  onClick={() => toggleDisable(u)}
                  className="grid h-9 w-9 place-items-center rounded-lg bg-surface-2 text-cream transition hover:bg-amber-500 hover:text-amber-950"
                  title={u.disabled ? 'Enable' : 'Disable'}
                >
                  {u.disabled ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setEditUser(u)}
                  className="grid h-9 w-9 place-items-center rounded-lg bg-surface-2 text-cream transition hover:bg-lilac hover:text-white"
                  title="Reset password"
                >
                  <KeyRound className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {creating && <CreateUserForm onClose={() => setCreating(false)} onSaved={(msg) => { setCreating(false); show(msg); load(); }} />}
      {editUser && <ResetPasswordForm user={editUser} onClose={() => setEditUser(null)} onSaved={(msg) => { setEditUser(null); show(msg); }} />}
    </div>
  );
}

function CreateUserForm({ onClose, onSaved }: { onClose: () => void; onSaved: (msg: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('content_editor');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setBusy(true); setError(null);
    if (password.length < 8) { setError('Password must be at least 8 characters.'); setBusy(false); return; }
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(FN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token ?? ''}` },
      body: JSON.stringify({ email, password, full_name: fullName, role }),
    });
    const json = await res.json();
    setBusy(false);
    if (json.error) { setError(json.error); return; }
    onSaved('User created successfully.');
  };

  return (
    <FormShell title="Add User" onClose={onClose} onSave={save} busy={busy} error={error} saveLabel="Create User">
      <Field label="Email"><input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
      <Field label="Password"><input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 8 characters" /></Field>
      <Field label="Full Name"><input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} /></Field>
      <Field label="Role">
        <select className="input" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
          <option value="content_editor">Content Editor</option>
          <option value="super_admin">Super Admin</option>
        </select>
      </Field>
    </FormShell>
  );
}

function ResetPasswordForm({ user, onClose, onSaved }: { user: AdminUser; onClose: () => void; onSaved: (msg: string) => void }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setBusy(true); setError(null);
    if (password.length < 8) { setError('Password must be at least 8 characters.'); setBusy(false); return; }
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${FN_URL}/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token ?? ''}` },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (res.ok) onSaved('Password reset successfully.');
    else setError('Failed to reset password.');
  };

  return (
    <FormShell title={`Reset password: ${user.email}`} onClose={onClose} onSave={save} busy={busy} error={error} saveLabel="Reset Password">
      <Field label="New Password"><input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 8 characters" /></Field>
    </FormShell>
  );
}
