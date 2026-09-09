import { Loader2, ScrollText } from 'lucide-react';
import { useAuditLog } from '@/lib/hooks';
import { SectionHeader } from '../components';

export function AdminAuditLog() {
  const { entries, loading, error } = useAuditLog();

  const fmtAction = (action: string) => {
    const map: Record<string, string> = {
      create: 'Created', update: 'Updated', delete: 'Deleted',
      publish: 'Published', unpublish: 'Unpublished',
      user_create: 'Created user', user_update: 'Updated user', user_delete: 'Deleted user',
    };
    return map[action] ?? action;
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Audit Log" subtitle="Track all administrative actions on the site." />

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-lilac" /></div>
      ) : error ? (
        <div className="card-glass p-6 text-center text-sm text-red-300">{error}</div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ScrollText className="mb-3 h-12 w-12 text-cream/20" />
          <p className="text-sm text-cream/50">No activity logged yet.</p>
        </div>
      ) : (
        <div className="card-glass divide-y divide-white/5">
          {entries.map((e) => (
            <div key={e.id} className="flex items-start gap-3 p-4">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5">
                <ScrollText className="h-4 w-4 text-cream/50" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white">
                  <span className="font-medium">{fmtAction(e.action)}</span>
                  {e.entity_type && <span className="text-cream/60"> · {e.entity_type}</span>}
                </p>
                {e.entity_id && <p className="text-xs text-cream/40">ID: {e.entity_id}</p>}
                <p className="mt-0.5 text-xs text-cream/40">{new Date(e.created_at).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
