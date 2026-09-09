import { useMemo, useState } from 'react';
import { ArrowRight, Clock, User, Sparkles, LayoutGrid } from 'lucide-react';
import { usePrograms } from '@/lib/hooks';
import { PROGRAM_CATEGORY_META, type Program, type ProgramCategory } from '@/lib/types';
import { StateWrapper, EmptyState } from '@/components/StateWrapper';
import { Modal } from '@/components/Modal';

const FILTERS: ({ key: ProgramCategory | 'all'; label: string })[] = [
  { key: 'all', label: 'All' },
  ...Object.entries(PROGRAM_CATEGORY_META).map(([key, meta]) => ({ key: key as ProgramCategory, label: meta.label })),
];

export function ProgramsPage() {
  const { data: programs, loading, error } = usePrograms();
  const [filter, setFilter] = useState<ProgramCategory | 'all'>('all');
  const [selected, setSelected] = useState<Program | null>(null);

  const filtered = useMemo(() => (filter === 'all' ? programs : programs.filter((p) => p.category === filter)), [programs, filter]);

  return (
    <div className="pt-16">
      <section className="relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <span className="section-eyebrow"><LayoutGrid className="h-3.5 w-3.5" /> Programs & Clubs</span>
          <h1 className="mt-4 font-display text-4xl font-semibold text-white sm:text-5xl">Find your <span className="text-lilac-300">passion</span>.</h1>
          <p className="mt-4 max-w-2xl text-base text-cream/70">From debating to drama, science to football — there's a place for every interest at OCSHS. Click any card for the full details.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`chip transition-all duration-200 ${filter === f.key ? 'bg-lilac text-white' : 'bg-surface-2 text-cream/60 hover:text-white'}`}>
              {f.label}
            </button>
          ))}
        </div>

        <StateWrapper loading={loading} error={error} empty={filtered.length === 0 ? <EmptyState message="No programs in this category." /> : undefined}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => {
              const meta = PROGRAM_CATEGORY_META[p.category as ProgramCategory];
              return (
                <button key={p.id} onClick={() => setSelected(p)} className="card-glass group flex flex-col overflow-hidden text-left">
                  {p.image_url ? (
                    <div className="relative aspect-video overflow-hidden">
                      <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 to-transparent" />
                      <span className={`chip absolute left-3 top-3 ${meta.color}`}>{meta.label}</span>
                    </div>
                  ) : (
                    <div className="relative flex aspect-video items-center justify-center bg-ink-800">
                      <Sparkles className="h-8 w-8 text-lilac/40" />
                      <span className={`chip absolute left-3 top-3 ${meta.color}`}>{meta.label}</span>
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-lg font-semibold text-white">{p.name}</h3>
                    {p.description && <p className="mt-1.5 line-clamp-2 text-sm text-cream/60">{p.description}</p>}
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-lilac-300">View details <ArrowRight className="h-3 w-3 transition group-hover:translate-x-1" /></span>
                  </div>
                </button>
              );
            })}
          </div>
        </StateWrapper>
      </section>

      <Modal open={selected !== null} onClose={() => setSelected(null)} maxWidth="max-w-xl">
        {selected && (
          <div className="overflow-hidden rounded-2xl bg-surface">
            {selected.image_url && (
              <div className="relative aspect-video overflow-hidden">
                <img src={selected.image_url} alt={selected.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900 to-transparent" />
              </div>
            )}
            <div className="p-6">
              <span className={`chip ${PROGRAM_CATEGORY_META[selected.category as ProgramCategory].color}`}>{PROGRAM_CATEGORY_META[selected.category as ProgramCategory].label}</span>
              <h3 className="mt-3 font-display text-2xl font-semibold text-white">{selected.name}</h3>
              {selected.description && <p className="mt-3 text-sm leading-relaxed text-cream/70">{selected.description}</p>}
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {selected.meeting_time && (
                  <div className="card-glass flex items-center gap-2 p-3"><Clock className="h-4 w-4 text-lilac-300" /><span className="text-xs text-cream/70">{selected.meeting_time}</span></div>
                )}
                {selected.advisor && (
                  <div className="card-glass flex items-center gap-2 p-3"><User className="h-4 w-4 text-emerald" /><span className="text-xs text-cream/70">{selected.advisor}</span></div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
