import { useMemo, useState } from 'react';
import { Trophy, Star } from 'lucide-react';
import { useAwards } from '@/lib/hooks';
import { AWARD_CATEGORY_META, type AwardCategory } from '@/lib/types';
import { StateWrapper, EmptyState } from '@/components/StateWrapper';

const FILTERS: ({ key: AwardCategory | 'all'; label: string })[] = [
  { key: 'all', label: 'All' },
  ...Object.entries(AWARD_CATEGORY_META).map(([key, meta]) => ({ key: key as AwardCategory, label: meta.label })),
];

export function AwardsPage() {
  const { data: awards, loading, error } = useAwards();
  const [filter, setFilter] = useState<AwardCategory | 'all'>('all');

  const filtered = useMemo(() => (filter === 'all' ? awards : awards.filter((a) => a.category === filter)), [awards, filter]);
  const yearGroups = useMemo(() => {
    const map = new Map<number, typeof filtered>();
    filtered.forEach((a) => { if (!map.has(a.year)) map.set(a.year, []); map.get(a.year)!.push(a); });
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  }, [filtered]);

  return (
    <div className="pt-16">
      <section className="relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <span className="section-eyebrow justify-center"><Trophy className="h-3.5 w-3.5" /> Awards & Achievements</span>
          <h1 className="mt-4 font-display text-4xl font-semibold text-white sm:text-5xl">The <span className="text-lilac-300">trophy wall</span>.</h1>
          <p className="mt-4 mx-auto max-w-2xl text-base text-cream/70">A minimalist monument to excellence — {awards.length} honors and counting.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {FILTERS.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`chip transition-all duration-200 ${filter === f.key ? 'bg-lilac text-white' : 'bg-surface-2 text-cream/60 hover:text-white'}`}>
              {f.label}
            </button>
          ))}
        </div>

        <StateWrapper loading={loading} error={error} empty={filtered.length === 0 ? <EmptyState message="No awards in this category." /> : undefined}>
          <div className="space-y-14">
            {yearGroups.map(([year, items]) => (
              <div key={year}>
                <div className="mb-6 flex items-center gap-4">
                  <span className="font-display text-3xl font-bold text-lilac-300">{year}</span>
                  <div className="glow-divider flex-1" />
                  <span className="text-xs uppercase tracking-wider text-cream/40">{items.length} {items.length === 1 ? 'honor' : 'honors'}</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((a) => {
                    const meta = AWARD_CATEGORY_META[a.category as AwardCategory];
                    return (
                      <article key={a.id} className="card-glass group relative overflow-hidden p-6">
                        <div className="flex items-start justify-between">
                          <span className="grid h-12 w-12 place-items-center rounded-xl bg-lilac"><Trophy className="h-6 w-6 text-white" /></span>
                          <span className={`chip ${meta.color}`}>{meta.label}</span>
                        </div>
                        <h3 className="mt-4 font-display text-lg font-semibold text-white">{a.title}</h3>
                        {a.description && <p className="mt-2 text-sm leading-relaxed text-cream/65">{a.description}</p>}
                        {a.recipient && <p className="mt-3 flex items-center gap-1.5 text-xs text-cream/50"><Star className="h-3 w-3 text-lilac-300" /> {a.recipient}</p>}
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </StateWrapper>
      </section>
    </div>
  );
}
