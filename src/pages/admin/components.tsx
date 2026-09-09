import { useEffect, useState, type ReactNode } from 'react';
import {
  Plus, Pencil, Trash2, X, Loader2, Save, Search,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Modal } from '@/components/Modal';
import { StateWrapper, EmptyState } from '@/components/StateWrapper';
import { useAuth } from '@/lib/auth';

/* ------------------- Shared admin UI primitives ------------------- */
export function useCrud<T extends { id: string }>(table: string, order: string, ascending = true) {
  const { user } = useAuth();
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<T | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from(table).select('*').order(order, { ascending });
    if (error) setError('Failed to load data.'); else setItems((data ?? []) as T[]);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const remove = async (id: string, label: string) => {
    if (!confirm(`Delete this ${label}? This cannot be undone.`)) return;
    await supabase.from(table).delete().eq('id', id);
    await logAudit('delete', table, id);
    load();
  };

  const logAudit = async (action: string, entityType: string, entityId: string, details?: Record<string, unknown>) => {
    if (!user) return;
    await supabase.from('audit_log').insert({
      action, entity_type: entityType, entity_id: entityId,
      details: details ?? {},
    });
  };

  return { items, loading, error, editing, creating, setEditing, setCreating, load, remove, logAudit };
}

export function SectionHeader({ title, subtitle, onAdd, addLabel }: {
  title: string; subtitle?: string; onAdd?: () => void; addLabel?: string;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-cream/60">{subtitle}</p>}
      </div>
      {onAdd && (
        <button onClick={onAdd} className="btn-primary self-start sm:self-auto">
          <Plus className="h-4 w-4" /> {addLabel ?? 'Add'}
        </button>
      )}
    </div>
  );
}

export function AdminList({ loading, error, count, emptyMsg, children }: {
  loading: boolean; error: string | null; count: number; emptyMsg: string; children: ReactNode;
}) {
  return (
    <StateWrapper loading={loading} error={error}>
      {count === 0 && !loading ? <EmptyState message={emptyMsg} /> : children}
    </StateWrapper>
  );
}

export function RowActions({ onEdit, onDelete, small }: { onEdit: () => void; onDelete: () => void; small?: boolean }) {
  const s = small ? 'h-8 w-8' : 'h-9 w-9';
  return (
    <div className="flex shrink-0 gap-1.5">
      <button onClick={onEdit} className={`grid place-items-center rounded-lg bg-surface-2 text-cream transition hover:bg-lilac hover:text-white ${s}`}><Pencil className="h-3.5 w-3.5" /></button>
      <button onClick={onDelete} className={`grid place-items-center rounded-lg bg-surface-2 text-cream transition hover:bg-red-500 hover:text-white ${s}`}><Trash2 className="h-3.5 w-3.5" /></button>
    </div>
  );
}

export function FormShell({ title, onClose, onSave, busy, error, saveLabel, children, extraActions }: {
  title: string; onClose: () => void; onSave: () => void; busy: boolean; error: string | null;
  saveLabel?: string; children: ReactNode; extraActions?: ReactNode;
}) {
  return (
    <Modal open onClose={onClose} maxWidth="max-w-lg">
      <div className="rounded-2xl bg-surface p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg bg-surface-2 text-cream/60 hover:text-white hover:bg-lilac"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-4">
          {children}
          {error && <div className="rounded-xl bg-red-500 px-4 py-3 text-sm text-white">{error}</div>}
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            {extraActions}
            <button onClick={onClose} className="btn-ghost">Cancel</button>
            <button onClick={onSave} disabled={busy} className="btn-primary">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {saveLabel ?? 'Save'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div><label className="label">{label}</label>{children}</div>;
}

export function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative mb-4 max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/40" />
      <input
        className="input pl-10"
        placeholder={placeholder ?? 'Search…'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function StatusBadge({ status }: { status: 'draft' | 'published' }) {
  const isPub = status === 'published';
  return (
    <span className={`chip ${isPub ? 'bg-emerald text-emerald' : 'bg-amber-500 text-amber-950'}`}>
      {isPub ? 'Published' : 'Draft'}
    </span>
  );
}

export function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-[200] rounded-xl px-5 py-3 text-sm font-medium animate-fadeUp ${type === 'success' ? 'bg-emerald text-emerald' : 'bg-red-500 text-white'}`}>
      {message}
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const show = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  return { toast, show };
}
