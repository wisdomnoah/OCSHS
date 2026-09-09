import { useMemo, useState } from 'react';
import { Images, ZoomIn } from 'lucide-react';
import { useGallery } from '@/lib/hooks';
import { GALLERY_CATEGORY_META, type GalleryCategory } from '@/lib/types';
import { StateWrapper, EmptyState } from '@/components/StateWrapper';
import { Modal } from '@/components/Modal';

const FILTERS: ({ key: GalleryCategory | 'all'; label: string })[] = [
  { key: 'all', label: 'All' },
  ...Object.entries(GALLERY_CATEGORY_META).map(([key, label]) => ({ key: key as GalleryCategory, label })),
];

export function GalleryPage() {
  const [filter, setFilter] = useState<GalleryCategory | 'all'>('all');
  const { data, loading, error } = useGallery();
  const [modalIdx, setModalIdx] = useState<number | null>(null);

  const filtered = useMemo(() => (filter === 'all' ? data : data.filter((g) => g.category === filter)), [data, filter]);
  const modalItem = modalIdx !== null ? filtered[modalIdx] : null;

  const spanFor = (i: number, total: number) => {
    if (total >= 6) {
      const pattern = ['sm:col-span-2 sm:row-span-2', '', '', 'sm:col-span-2', '', 'sm:row-span-2'];
      return pattern[i % pattern.length];
    }
    return i === 0 ? 'sm:col-span-2 sm:row-span-2' : '';
  };

  return (
    <div className="pt-16">
      <section className="relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <span className="section-eyebrow"><Images className="h-3.5 w-3.5" /> Gallery & Campus</span>
          <h1 className="mt-4 font-display text-4xl font-semibold text-white sm:text-5xl">
            Life at <span className="text-lilac-300">OCSHS</span>.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-cream/70">A bento-style look at the spaces, students and moments that make our school community.</p>
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

        <StateWrapper loading={loading} error={error} empty={filtered.length === 0 ? <EmptyState message="No images in this category yet." /> : undefined}>
          <div className="grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[220px] sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((item, i) => (
              <button key={item.id} onClick={() => setModalIdx(i)} className={`group relative overflow-hidden rounded-2xl ${spanFor(i, filtered.length)}`}>
                <img src={item.image_url} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/10 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-95" />

                <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                  <span className="chip bg-lilac text-white">{GALLERY_CATEGORY_META[item.category]}</span>
                  <p className="mt-2 font-display text-sm font-medium text-white sm:text-base">{item.title}</p>
                </div>
                <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-surface-2/90 opacity-0 transition group-hover:opacity-100">
                  <ZoomIn className="h-4 w-4 text-white" />
                </span>
              </button>
            ))}
          </div>
        </StateWrapper>
      </section>

      <Modal open={modalIdx !== null} onClose={() => setModalIdx(null)} maxWidth="max-w-4xl">
        {modalItem && (
          <div className="overflow-hidden rounded-2xl bg-surface">
            <div className="relative">
              <img src={modalItem.image_url} alt={modalItem.title} className="max-h-[70vh] w-full object-contain bg-ink-950" />
              <button onClick={() => setModalIdx((p) => (p === null ? null : Math.max(0, p - 1)))} disabled={modalIdx === 0}
                className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-surface-2/90 text-white transition hover:bg-lilac disabled:opacity-30">‹</button>
              <button onClick={() => setModalIdx((p) => (p === null || p >= filtered.length - 1 ? null : p + 1))} disabled={modalIdx === filtered.length - 1}
                className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-surface-2/90 text-white transition hover:bg-lilac disabled:opacity-30">›</button>
            </div>
            <div className="flex items-start justify-between gap-4 p-5">
              <div>
                <span className="chip bg-lilac text-white">{GALLERY_CATEGORY_META[modalItem.category]}</span>
                <h3 className="mt-2 font-display text-lg font-semibold text-white">{modalItem.title}</h3>
                {modalItem.description && <p className="mt-1 text-sm text-cream/65">{modalItem.description}</p>}
              </div>
              <span className="shrink-0 text-xs text-cream/40">{modalIdx! + 1} / {filtered.length}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
