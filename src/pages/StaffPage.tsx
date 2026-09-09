import { useMemo, useState } from 'react';
import { Mail, Search, Users } from 'lucide-react';
import { useStaff } from '@/lib/hooks';
import { StateWrapper, EmptyState } from '@/components/StateWrapper';

export function StaffPage() {
  const { data: staff, loading, error } = useStaff();
  const [dept, setDept] = useState<string>('all');
  const [query, setQuery] = useState('');

  const departments = useMemo(() => {
    const set = new Set<string>();
    staff.forEach((s) => set.add(s.department));
    return ['all', ...Array.from(set).sort()];
  }, [staff]);

  const filtered = useMemo(() => staff.filter((s) => {
    const deptOk = dept === 'all' || s.department === dept;
    const q = query.trim().toLowerCase();
    const queryOk = !q || s.name.toLowerCase().includes(q) || s.role.toLowerCase().includes(q) || s.department.toLowerCase().includes(q);
    return deptOk && queryOk;
  }), [staff, dept, query]);

  return (
    <div className="pt-16">
      <section className="relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <span className="section-eyebrow"><Users className="h-3.5 w-3.5" /> Staff Directory</span>
          <h1 className="mt-4 font-display text-4xl font-semibold text-white sm:text-5xl">Meet the <span className="text-lilac-300">educators</span>.</h1>
          <p className="mt-4 max-w-2xl text-base text-cream/70">26 dedicated teachers and leaders behind every breakthrough. Filter by department or search by name.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/40" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search staff…" className="input pl-10" />
          </div>
          <div className="flex flex-wrap gap-2">
            {departments.map((d) => (
              <button key={d} onClick={() => setDept(d)}
                className={`chip transition-all duration-200 ${dept === d ? 'bg-lilac text-white' : 'bg-surface-2 text-cream/60 hover:text-white'}`}>
                {d === 'all' ? 'All Departments' : d}
              </button>
            ))}
          </div>
        </div>

        <StateWrapper loading={loading} error={error} empty={filtered.length === 0 ? <EmptyState message="No staff match your search." /> : undefined}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((s) => (
              <article key={s.id} className="card-glass group overflow-hidden">
                <div className="relative aspect-[4/5] overflow-hidden">
                  {s.photo_url ? (
                    <img src={s.photo_url} alt={s.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-ink-800 text-cream/30"><Users className="h-10 w-10" /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />
                  <span className="absolute left-3 top-3 chip bg-lilac text-white">{s.department}</span>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-base font-semibold text-white">{s.name}</h3>
                  <p className="text-sm text-emerald">{s.role}</p>
                  {s.bio && <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-cream/55">{s.bio}</p>}
                  {s.email && (
                    <a href={`mailto:${s.email}`} className="mt-3 inline-flex items-center gap-1.5 text-xs text-cream/60 transition hover:text-lilac-300">
                      <Mail className="h-3.5 w-3.5" /> {s.email}
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </StateWrapper>
      </section>
    </div>
  );
}
