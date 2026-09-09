import { useState } from 'react';
import { Mail, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { SectionHeader, SearchBar, useToast, Toast } from '../components';
import type { ContactMessage } from '@/lib/types';

export function AdminMessages() {
  const { toast, show } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    if (error) show('Failed to load messages.', 'error');
    else setMessages((data ?? []) as ContactMessage[]);
    setLoading(false);
  };

  // Load on mount
  useState(() => { load(); });

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) show('Failed to delete.', 'error');
    else { show('Message deleted.'); load(); }
  };

  const filtered = messages.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {toast && <Toast {...toast} />}
      <SectionHeader title="Messages" subtitle="Messages submitted through the public contact form." />
      <SearchBar value={search} onChange={setSearch} placeholder="Search messages…" />

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-lilac" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Mail className="mb-3 h-12 w-12 text-cream/20" />
          <p className="text-sm text-cream/50">{search ? 'No matching messages.' : 'No messages yet.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => (
            <div key={m.id} className="card-glass p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white">{m.name}</h3>
                    <span className="chip bg-surface-2 text-cream">{m.subject}</span>
                  </div>
                  <a href={`mailto:${m.email}`} className="text-xs text-lilac-300 hover:underline">{m.email}</a>
                  <p className="mt-2 text-sm text-cream/70">{m.message}</p>
                  <p className="mt-1 text-xs text-cream/40">{new Date(m.created_at).toLocaleString()}</p>
                </div>
                <button onClick={() => handleDelete(m.id)} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-cream transition hover:bg-red-500 hover:text-white">
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
